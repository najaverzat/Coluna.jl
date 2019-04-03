# Membership is just a Manager{Id,Float64}
const Membership{T} = Manager{Id{T},Float64}

Membership(T::Type{<:AbstractVarConstr}) = Manager(T, Float64)

const VarMembership = Membership{VarInfo}

const ConstrMembership = Membership{ConstrInfo}

const VarId = Id{VarInfo}

const ConstrId = Id{ConstrInfo}

const VarManager = Manager{VarId, Variable}

const ConstrManager = Manager{ConstrId, Constraint}


struct Memberships
    var_to_constr_members    ::Dict{Id{VarInfo}, Membership{ConstrInfo}}
    constr_to_var_members    ::Dict{Id{ConstrInfo}, Membership{VarInfo}}
    var_to_partialsol_members::Dict{Id{VarInfo}, Membership{VarInfo}}
    partialsol_to_var_members::Dict{Id{VarInfo}, Membership{VarInfo}}
    var_to_expression_members::Dict{Id{VarInfo}, Membership{VarInfo}}
    expression_to_var_members::Dict{Id{VarInfo}, Membership{VarInfo}}
end

function check_if_exists(dict::Dict{Id, Membership}, membership::Membership)
    for (id, m) in dict
        if (m == membership)
            return id
        end
    end
    return 0
end

function Memberships()
    return Memberships(Dict{Id{VarInfo}, Membership{ConstrInfo}}(),
                       Dict{Id{ConstrInfo}, Membership{VarInfo}}(), 
                       Dict{Id{VarInfo}, Membership{VarInfo}}(), 
                       Dict{Id{VarInfo}, Membership{VarInfo}}(), 
                       Dict{Id{VarInfo}, Membership{VarInfo}}(), 
                       Dict{Id{VarInfo}, Membership{VarInfo}}())
end

#function add_var!(m::Membership(Variable), var_id::Id, val::Float64)
#    m[var_id] = valx
#end

#function add_constr!(m::Membership{ConstrInfo}, constr_id::Id, val::Float64)
#    m[constr_id] = val
#end

    
get_subset(m::Membership, Duty::Type{<:AbstractConstrDuty}, stat::Status) =
    filter(e -> dutytype(getinfo(e)) == Duty && getinfo(e).status == stat, m.members)


function get_constr_members_of_var(m::Memberships, var_id::Id) 
    if haskey(m.var_to_constr_members, var_id)
        return m.var_to_constr_members[var_id]
    end
    error("Variable $var_id not stored in formulation.")
end

function get_var_members_of_constr(m::Memberships, constr_id::Id) 
    if haskey(m.constr_to_var_members, constr_id)
        return m.constr_to_var_members[constr_id]
    end
    error("Constraint $constr_id not stored in formulation.")
end

function get_var_members_of_expression(m::Memberships, eprex_uid::Id) 
    if haskey(m.expression_to_var_members, eprex_uid)
        return m.expression_to_var_members[eprex_uid]
    end
    error("Expression $uid not stored in formulation.")
end

function add_constr_members_of_var!(m::Memberships, var_id::Id, 
        constr_id::Id, coef::Float64)
    if !haskey(m.var_to_constr_members, var_id)
        m.var_to_constr_members[var_id] = Membership(Constraint)
    end
    add!(m.var_to_constr_members[var_id], constr_id, coef)

    if !haskey(m.constr_to_var_members, constr_id)
        m.constr_to_var_members[constr_id] = Membership(Variable)
    end
    add!(m.constr_to_var_members[constr_id], var_id, coef)
end

function add_constr_members_of_var!(m::Memberships, var_id::Id, 
        new_membership::Membership{ConstrInfo}) 
    m.var_to_constr_members[var_id] = new_membership

    for (constr_id, val) in new_membership
        if !haskey(m.constr_to_var_members, constr_id)
            m.constr_to_var_members[constr_id] = Membership(Variable)
        end
        add!(m.constr_to_var_members[constr_id], var_id, val)
    end
end

function add_var_members_of_constr!(m::Memberships, constr_id::Id, 
        new_membership::Membership{VarInfo}) 
    m.constr_to_var_members[constr_id] = new_membership

    for (var_id, val) in new_membership
        if !haskey(m.var_to_constr_members, var_id)
            m.var_to_constr_members[var_id] = Membership(Constraint)
        end
        add!(m.var_to_constr_members[var_id], constr_id, val)
    end
end

function add_partialsol_members_of_var!(m::Memberships, ps_var_id::Id, var_id::Int, 
        coef::Float64)
    if !haskey(m.var_to_partialsol_members, ps_var_id)
        m.var_to_partialsol_members[ps_var_id] = Membership(Variable)
    end
    add!(m.var_to_partialsol_members[ps_var_id], var_id, coef)

    if !haskey(m.partialsol_to_var_members, mc_uid)
        m.partialsol_to_var_members[var_id] = Membership(Variable)
    end
    add!(m.partialsol_to_var_members[var_id], ps_var_id, coef)
end

function add_partialsol_members_of_var!(m::Memberships, ps_var_id::Id, 
        new_membership::Membership{VarInfo}) 
    m.var_to_partialsol_members[ps_var_id] = new_membership

    for (var_id, val) in new_membership
        if !haskey(m.partialsol_to_var_members, var_id)
            m.partialsol_to_var_members[var_id] = Membership(Variable)
        end
        add!(m.partialsol_to_var_members[var_id], ps_var_id, val)
    end
end

function add_var_members_of_partialsol!(m::Memberships, mc_uid::Id, spvar_id, 
        coef::Float64)
    if !haskey(m.partialsol_to_var_members, mc_uid)
        m.partialsol_to_var_members[mc_uid] = Membership(Variable)
    end
    add!(m.partialsol_to_var_members[mc_uid], spvar_id, coef)

    if !haskey(m.var_to_partialsol_members, spvar_id)
        m.var_to_partialsol_members[spvar_id] = Membership(Variable)
    end
    add!(m.var_to_partialsol_members[spvar_id], mc_uid, coef)
end

function add_var_members_of_partialsol!(m::Memberships, mc_uid::Id, 
        new_membership::Membership{VarInfo}) 
    if !haskey(m.partialsol_to_var_members, mc_uid)
        m.partialsol_to_var_members[mc_uid] = Membership(Variable)()
    end
    
    spvar_ids, vals = get_ids_vals(new_membership)
    for j in 1:length(mc_uids)
        add!(m.partialsol_to_var_members[mc_uid], spvar_ids[j], vals[j])
        if !haskey(m.var_to_partialsol_members, spvar_ids[j])
            m.var_to_partialsol_members[spvar_ids[j]] = Membership(Variable)
        end
        add!(m.var_to_partialsol_members[spvar_ids[j]], mc_uid, vals[j])
    end
end

function reset_constr_members_of_var!(m::Memberships, var_id::Id, 
        new_membership::Membership{ConstrInfo}) 
    m.var_to_constr_members[var_id] = new_membership
end

function reset_var_members_of_constr!(m::Memberships, constr_id::Id,
         new_membership::Membership{VarInfo}) 
    m.constr_to_var_members[constr_id] = new_membership
end

function set_constr_members_of_var!(m::Memberships, var_id::Id, new_membership::Membership{ConstrInfo}) 
    m.var_to_constr_members[var_id] = new_membership
    for (constr_id, val) in new_membership
        if !haskey(m.constr_to_var_members, constr_id)
            m.constr_to_var_members[constr_id] = Membership(Variable) 
        end
        add!(m.constr_to_var_members[constr_id], var_id, val)
    end
end

function set_var_members_of_constr!(m::Memberships, constr_id::Id, new_membership::Membership{VarInfo}) 
    m.constr_to_var_members[constr_id] = new_membership
    for (var_id, val) in new_membership
        if !haskey(m.var_to_constr_members, var_id)
            m.var_to_constr_members[var_id] = Membership(Constraint)
        end
        add!(m.var_to_constr_members[var_id], constr_id, val)
    end
end

function add_variable!(m::Memberships, var_id::Id)
    if !haskey(m.var_to_constr_members, var_id)
        m.var_to_constr_members[var_id] = Membership(Constraint)
    end
    return
end

function add_variable!(m::Memberships, var_id::Id, membership::Membership{ConstrInfo})
    set_constr_members_of_var!(m, var_id, membership)
    return
end

function add_constraint!(m::Memberships, constr_id::Id)
    if !haskey(m.constr_to_var_members, constr_id)
        m.constr_to_var_members[constr_id] = Membership(Variable)
    end
    return
end

function add_constraint!(m::Memberships, constr_id::Id, 
        membership::Membership{VarInfo})
    add_var_members_of_constr!(m, constr_id, membership)
    return
end
