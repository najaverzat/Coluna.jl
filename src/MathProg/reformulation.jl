# TODO make immutable
mutable struct Reformulation <: AbstractFormulation
    uid::Int
    parent::Union{Nothing, AbstractFormulation} # reference to (pointer to) ancestor:  Formulation or Reformulation (TODO rm Nothing)
    master::Union{Nothing, Formulation}  # TODO : rm Nothing
    dw_pricing_subprs::Dict{FormId, AbstractModel} 
    benders_sep_subprs::Dict{FormId, AbstractModel}
    storage::Union{Nothing,NewStorage}
    node_user_info::Union{Nothing,AbstractNodeUserInfo}
end

"""
`Reformulation` is a representation of a formulation which is solved by Coluna 
using a decomposition approach.

    Reformulation(env)

Construct an empty `Reformulation`.
 """
function Reformulation(env)
    uid = env.form_counter += 1
    reform = Reformulation(
        uid,
        nothing,
        nothing,
        Dict{FormId, AbstractModel}(),
        Dict{FormId, AbstractModel}(),
        nothing,
        nothing
    )
    reform.storage = NewStorage(reform)
    return reform
end

# methods of the AbstractModel interface

ClB.getuid(reform::Reformulation) = reform.uid
ClB.getstorage(reform::Reformulation) = reform.storage

# methods specific to Formulation

set_user_info!(reform::Reformulation, info::AbstractNodeUserInfo) = reform.node_user_info = info
get_user_info(reform::Reformulation) = reform.node_user_info

"""
    getobjsense(reformulation)

Return the objective sense of the master problem of the reformulation.
If the master problem has not been defined, it throws an error.
"""
function getobjsense(r::Reformulation)
    r.master !== nothing && return getobjsense(r.master)
    error("Undefined master in the reformulation, cannot return the objective sense.")
end

"""
    getmaster(reform) -> Formulation

Return the formulation of the master problem.
"""
getmaster(r::Reformulation) = r.master

# TODO : remove
setmaster!(r::Reformulation, f::Formulation) = r.master = f

"""
    add_dw_pricing_sp!(reformulation, abstractmodel)

Add a Dantzig-Wolfe pricing subproblem in the reformulation.
"""
add_dw_pricing_sp!(r::Reformulation, f) = r.dw_pricing_subprs[getuid(f)] = f

"""
    add_benders_sep_sp!(reformulation, abstractmodel)

Add a Benders separation subproblem in the reformulation.
"""
add_benders_sep_sp!(r::Reformulation, f) = r.benders_sep_subprs[getuid(f)] = f

"""
    get_dw_pricing_sps(reformulation)

Return a `Dict{FormId, AbstractModel}` containing all Dabtzig-Wolfe pricing subproblems of
the reformulation.
"""
get_dw_pricing_sps(r::Reformulation) = r.dw_pricing_subprs

"""
    get_benders_sep_sps(reformulation)

Return a `Dict{FormId, AbstractModel}` containing all Benders separation subproblems of the
reformulation.
"""
get_benders_sep_sps(r::Reformulation) = r.benders_sep_subprs

"""
    get_dw_pricing_sp_ub_constrid(reformulation, spid)

Return the `ConstrId` of the upper bounded convexity constraint of Dantzig-Wolfe pricing
subproblem with id `spid`.
"""
get_dw_pricing_sp_ub_constrid(r::Reformulation, spid) = r.dw_pricing_subprs[spid].duty_data.upper_multiplicity_constr_id

"""
    get_dw_pricing_sp_lb_constrid(reformulation, spid)

Return the `ConstrId` of the lower bounded convexity constraint of Dantzig-Wolfe pricing
subproblem with id `spid`.
"""
get_dw_pricing_sp_lb_constrid(r::Reformulation, spid) = r.dw_pricing_subprs[spid].duty_data.lower_multiplicity_constr_id

############################################################################################
# Initial columns callback
############################################################################################
struct InitialColumnsCallbackData
    form::Formulation
    primal_solutions::Vector{PrimalSolution}
end

# Method to initial the solution pools of the subproblems
function initialize_solution_pools!(reform::Reformulation, initial_columns_callback::Function)
    for (_, sp) in get_dw_pricing_sps(reform)
        initialize_solution_pool!(sp, initial_columns_callback)
    end
    return
end

initialize_solution_pools!(::Reformulation, ::Nothing) = nothing # fallback

# Following two functions are temporary, we must store a pointer to the vc
# being represented by a representative vc
function vc_belongs_to_formulation(form::Formulation, vc::AbstractVarConstr)
    !haskey(form, getid(vc)) && return false
    vc_in_formulation = getelem(form, getid(vc))
    isexplicit(form, vc_in_formulation) && return true
    return false
end

function find_owner_formulation(reform::Reformulation, vc::AbstractVarConstr)
    vc_belongs_to_formulation(reform.master, vc) && return reform.master
    for (formid, spform) in get_dw_pricing_sps(reform)
        vc_belongs_to_formulation(spform, vc) && return spform
    end
   @error(string("VC ", vc.name, " does not belong to any problem in reformulation"))
end

function Base.show(io::IO, reform::Reformulation)
    compact = get(io, :compact, false)
    if compact
        print(io, "Reformulation")
    end
end
