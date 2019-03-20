const SupportedObjFunc = Union{MOI.ScalarAffineFunction{Float64},
                               MOI.SingleVariable}

const SupportedVarSets = Union{MOI.Nonnegatives, 
                                MOI.Zeros,
                                MOI.Nonpositives,
                                MOI.ZeroOne,
                                MOI.Integer,
                                MOI.LessThan{Float64},
                                MOI.EqualTo{Float64},
                                MOI.GreaterThan{Float64},
                                MOI.Interval{Float64}}

const SupportedConstrFunc = Union{MOI.ScalarAffineFunction{Float64}}

const SupportedConstrSets = Union{MOI.EqualTo{Float64},
                                  MOI.GreaterThan{Float64},
                                  MOI.LessThan{Float64},
                                  MOI.Zeros}

mutable struct Optimizer <: MOI.AbstractOptimizer
    inner::Union{Nothing, Model}
    # varmap::Dict{MOI.VariableIndex,Variable} ## Keys and values are created in this file
    # # add conmap here
    # constr_probidx_map::Dict{Constraint,Int}
    # var_probidx_map::Dict{Variable,Int}
    # nb_subproblems::Int
    # master_factory::JuMP.OptimizerFactory
    # pricing_factory::JuMP.OptimizerFactory
end

function Optimizer(;kwargs...)
    return Optimizer(nothing)
end

function MOI.optimize!(optimizer::Optimizer)
    println("\e[34m OPTIMIZE \e[00m")
end

# function MOI.optimize!(coluna_optimizer::Optimizer)
#     solve(coluna_optimizer.inner)
# end

function MOI.get(dest::MOIU.UniversalFallback,
        attribute::BD.ConstraintDecomposition, ci::MOI.ConstraintIndex)
    if haskey(dest.conattr, attribute)
        if haskey(dest.conattr[attribute], ci)
            return dest.conattr[attribute][ci]
        end
        #error("No annotation found for variable $vi.")
    end
    return ()
end

function MOI.get(dest::MOIU.UniversalFallback,
        attribute::BD.VariableDecomposition, vi::MOI.VariableIndex)
    if haskey(dest.varattr, attribute)
        if haskey(dest.varattr[attribute], vi)
            return dest.varattr[attribute][vi]
        end
        #error("No annotation found for variable $vi.")
    end
    return ()
end

function MOI.supports_constraint(optimizer::Optimizer, 
        ::Type{<: SupportedConstrFunc}, ::Type{<: SupportedConstrSets})
    return true
end

function MOI.supports_constraint(optimizer::Optimizer,
        ::Type{MOI.SingleVariable}, ::Type{<: SupportedVarSets})
    return true
end

function MOI.supports(optimizer::Optimizer, 
        ::MOI.ObjectiveFunction{<: SupportedObjFunc})
    return true
end

function load_obj!(costs::Vector{Float64}, vars::Vector{Variable}, 
        moi_map::MOIU.IndexMap, f::MOI.ScalarAffineFunction)
    # We need to increment values of cost_rhs with += to handle cases like $x_1 + x_2 + x_1$
    # This is safe becasue the variables are initialized with a 0.0 cost_rhs
    for term in f.terms
        coluna_var_id = moi_map[term.variable_index].value
        costs[coluna_var_id] += term.coefficient
    end
    return
end

function create_origvars!(vars::Vector{Variable}, m::Model, 
        moi_map::MOIU.IndexMap, src::MOI.ModelLike, copy_names::Bool)
    for m_var_id in MOI.get(src, MOI.ListOfVariableIndices())
        if copy_names
            name = MOI.get(src, MOI.VariableName(), m_var_id)
        else
            name = string("var_", m_var_id.value)
        end
        var = OriginalVariable(m, m_var_id, name)
        push!(vars, var)
        c_var_id = MOI.VariableIndex(getuid(var))
        setindex!(moi_map, c_var_id, m_var_id)
    end
    return
end

function update_var_bounds_types!(lb, ub, vtypes, c_var_id, ::MOI.ZeroOne)
    vtypes[c_var_id] = Binary
    (lb[c_var_id] < 0) && (lb[c_var_id] = 0)
    (ub[c_var_id] > 1) && (ub[c_var_id] = 1)
    return
end

function update_var_bounds_types!(lb, ub, vtypes, c_var_id, ::MOI.Integer)
    vtypes[c_var_id] = Integ
    return
end

function update_var_bounds_types!(lb, ub, vtypes, c_var_id, s::MOI.GreaterThan)
    l = float(s.lower)
    (lb[c_var_id] < l) && (lb[c_var_id] = l)
    return
end

function update_var_bounds_types!(lb, ub, vtypes, c_var_id, s::MOI.EqualTo)
    val = float(s.value)
    ub[c_var_id] = val
    lb[c_var_id] = val
    return
end

function update_var_bounds_types!(lb, ub, vtypes, c_var_id, s::MOI.LessThan)
    u = float(s.upper)
    (ub[c_var_id] > u) && (ub[c_var_id] = u)
    return
end

function retrieve_vars_bounds_types!(lb::Vector{Float64}, ub::Vector{Float64}, 
        vtype::Vector{VarType}, vars, moi_map, src)
    for (F, S) in MOI.get(src, MOI.ListOfConstraints())
        if F isa MOI.SingleVariable
            for m_constr_id in MOI.get(src, MOI.ListOfConstraintIndices{F, S}())
                f = MOI.get(src, MOI.ConstraintFunction(), m_constr_id)
                s = MOI.get(src, MOI.ConstraintSet(), m_constr_id)
                c_var_id = moi_map[f.variable].value
                update_var_bounds_types!(lb, ub, vtype, c_var_id, s)
            end
        end
    end
    return
end

getconstrsense(::MOI.GreaterThan) = Greater
getconstrsense(::MOI.EqualTo) = Equal
getconstrsense(::MOI.LessThan) = Less
getrhs(s::MOI.EqualTo) = float(s.value)
getrhs(s::MOI.GreaterThan) = float(s.lower)
getrhs(s::MOI.LessThan) = float(s.upper)

function create_origconstr!(constrs, memberships, rhs, csenses, moi_map, m, 
        name, f::MOI.ScalarAffineFunction, s, m_constr_id)
    constr = OriginalConstraint(m, m_constr_id, name)
    push!(constrs, constr)
    push!(rhs, getrhs(s))
    push!(csenses, getconstrsense(s))
    membership = spzeros(Float64, MAX_SV_ENTRIES)
    for term in f.terms
        c_var_id = moi_map[term.variable_index].value
        membership[c_var_id] = term.coefficient
    end
    push!(memberships, membership)
    c_constr_id = MOI.ConstraintIndex{typeof(f),typeof(s)}(getuid(constr))
    setindex!(moi_map, c_constr_id, m_constr_id)
    return
end

function create_origconstrs!(constrs::Vector{Constraint}, 
        memberships::Vector{SparseVector}, rhs::Vector{Float64}, 
        csenses::Vector{ConstrSense}, m::Model, moi_map::MOIU.IndexMap, 
        src::MOI.ModelLike, copy_names::Bool)
    for (F, S) in MOI.get(src, MOI.ListOfConstraints())
        if !isa(F, Type{MOI.SingleVariable})
            for m_constr_id in MOI.get(src, MOI.ListOfConstraintIndices{F, S}())
                if copy_names
                    name = MOI.get(src, MOI.ConstraintName(), m_constr_id)
                else
                    name = string("constr_", m_constr_id.value)
                end
                f = MOI.get(src, MOI.ConstraintFunction(), m_constr_id)
                s = MOI.get(src, MOI.ConstraintSet(), m_constr_id)
                create_origconstr!(constrs, memberships, rhs, csenses, moi_map, 
                    m, name, f, s, m_constr_id)
            end
        end
    end
    return
end

function load_decomposition_annotations!(var_ann::Dict{Int, BD.Annotation},
        constr_ann::Dict{Int, BD.Annotation}, src::MOI.ModelLike, 
        moi_map::MOIU.IndexMap)
    for (m_id, c_id) in moi_map.conmap
        constr_ann[c_id.value] = MOI.get(src, BD.ConstraintDecomposition(), m_id)
    end
    for (m_id, c_id) in moi_map.varmap
        var_ann[c_id.value] = MOI.get(src, BD.VariableDecomposition(), m_id)
    end
    return
end

function MOI.copy_to(dest::Optimizer, src::MOI.ModelLike; copy_names=true)
    println("\e[1m;45m COPY TO \e[00m")

    mapping = MOIU.IndexMap() # map from moi idx to coluna idx
    model = Model()
    orig_form = Formulation(model, src)
    set_original_formulation!(model, orig_form)

    # Retrieve variables
    vars = Variable[]
    create_origvars!(vars, model, mapping, src, copy_names)
    lb = fill(-Inf, length(vars))
    ub = fill(Inf, length(vars))
    vtypes = fill(Continuous, length(vars))
    retrieve_vars_bounds_types!(lb, ub, vtypes, vars, mapping, src)

    costs = zeros(Float64, length(vars))
    obj = MOI.get(src, MOI.ObjectiveFunction{MOI.ScalarAffineFunction{Float64}}())
    load_obj!(costs, vars, mapping, obj)

    register_variables!(orig_form, vars, costs, lb, ub, vtypes)

    # Retrieve constraints
    constrs = Constraint[]
    memberships = SparseVector[]
    rhs = Float64[]
    csenses = ConstrSense[]
    create_origconstrs!(constrs, memberships, rhs, csenses, model, mapping, src, copy_names)
    register_constraints!(orig_form, constrs, memberships, csenses, rhs)

    sense = MOI.get(src, MOI.ObjectiveSense())
    @show sense
    #register_objective_sense!(orig_form,)

    # Retrieve annotations
    var_ann = Dict{Int, BD.Annotation}()
    constr_ann = Dict{Int, BD.Annotation}()
    load_decomposition_annotations!(var_ann, constr_ann, src, mapping)
    @show var_ann
    @show constr_ann
    return mapping
end


# function set_optimizers_dict(dest::Optimizer)
#     # set coluna optimizers
#     model = dest.inner
#     master_problem = model.extended_problem.master_problem
#     model.problemidx_optimizer_map[master_problem.prob_ref] =
#             dest.master_factory()
#     for subprobidx in 1:dest.nb_subproblems
#         pricingprob = model.extended_problem.pricing_vect[subprobidx]
#         model.problemidx_optimizer_map[pricingprob.prob_ref] =
#                 dest.pricing_factory()
#     end
# end

# function MOI.set(coluna_optimizer::Optimizer, object::MOI.ObjectiveSense,
#                   sense::MOI.OptimizationSense)
#     if sense != MOI.MIN_SENSE
#         throw(MOI.CannotSetAttribute{MOI.ObjectiveSense}(MOI.ObjectiveSense, "Coluna only supports minimization sense for now."))
#     end
# end

function MOI.empty!(optimizer::Optimizer)
    optimizer.inner = nothing
end

# ######################
# ### Get functions ####
# ######################

MOI.is_empty(optimizer::Optimizer) = (optimizer.inner == nothing)

# function MOI.get(coluna_optimizer::Optimizer, object::MOI.ObjectiveBound)
#     return coluna_optimizer.inner.extended_problem.dual_inc_bound
# end

# function MOI.get(coluna_optimizer::Optimizer, object::MOI.ObjectiveValue)
#     return coluna_optimizer.inner.extended_problem.primal_inc_bound
# end

# function get_coluna_var_val(coluna_optimizer::Optimizer, sp_var::SubprobVar)
#     solution = coluna_optimizer.inner.extended_problem.solution.var_val_map
#     sp_var_val = 0.0
#     for (var,val) in solution
#         if isa(var, MasterVar)
#             continue
#         end
#         if haskey(var.solution.var_val_map, sp_var)
#             sp_var_val += val*var.solution.var_val_map[sp_var]
#         end
#     end
#     return sp_var_val
# end

# function get_coluna_var_val(coluna_optimizer::Optimizer, var::MasterVar)
#     solution = coluna_optimizer.inner.extended_problem.solution
#     if haskey(solution.var_val_map, var)
#         return solution.var_val_map[var]
#     else
#         return 0.0
#     end
# end

# function MOI.get(coluna_optimizer::Optimizer,
#                  object::MOI.VariablePrimal, ref::MOI.VariableIndex)
#     var = coluna_optimizer.varmap[ref] # This gets a coluna variable
#     return get_coluna_var_val(coluna_optimizer, var)
# end

# function MOI.get(coluna_optimizer::Optimizer,
#                  object::MOI.VariablePrimal, ref::Vector{MOI.VariableIndex})
#     return [MOI.get(coluna_optimizer, object, ref[i]) for i in 1:length(ref)]
# end

# function MOI.get(coluna_optimizer::Optimizer, object::MOI.ObjectiveSense)
#     # MaxSense is currently not supported
#     return MOI.MIN_SENSE
# end
