# The definition of a tree search algorithm is based on three concepts.
"Returns the type of search space depending on the tree-search algorithm and its parameters."
@mustimplement "TreeSearch" search_space_type(::AbstractAlgorithm)

"Creates and returns the search space of a tree search algorithm, its model, and its input."
@mustimplement "TreeSearch"  new_space(::Type{<:AbstractSearchSpace}, alg, model, input)

"Creates and returns the root node of a search space."
@mustimplement "TreeSearch" new_root(::AbstractSearchSpace, input)

"Returns the root node of the tree to which the node belongs."
@mustimplement "Node" get_root(::AbstractNode)

"Returns the parent of a node; `nothing` if the node is the root."
@mustimplement "Node" get_parent(::AbstractNode)

"Returns the priority of the node depending on the explore strategy."
@mustimplement "Node" get_priority(::AbstractExploreStrategy, ::AbstractNode)

##### Additional methods for the node interface (needed by conquer)
"Returns an `OptimizationState` that contains best bounds and solutions at the node."
@mustimplement "Node" get_opt_state(::AbstractNode) # conquer, divide

@mustimplement "Node" set_records!(::AbstractNode, records)

"Returns a `Records` that allows to restore the state of the formulation at this node."
@mustimplement "Node" get_records(::AbstractNode) # conquer

"Returns a `String` to display the branching constraint."
@mustimplement "Node" get_branch_description(::AbstractNode) # printer

"Returns `true` is the node is root; `false` otherwise."
@mustimplement "Node" isroot(::AbstractNode) # BaB implementation

# TODO: remove untreated nodes.
"Evaluate and generate children. This method has a specific implementation for Coluna."
@mustimplement "TreeSearch" children(sp, n, env, untreated_nodes)

"Returns true if stopping criteria are met; false otherwise."
@mustimplement "TreeSearch" stop(::AbstractSearchSpace, untreated_nodes)

# TODO: remove untreated nodes.
"Returns the output of the tree search algorithm."
@mustimplement "TreeSearch" tree_search_output(::AbstractSearchSpace, untreated_nodes)
