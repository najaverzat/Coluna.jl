struct DepthFirstStrategy <: AbstractExploreStrategy end

abstract type AbstractBestFirstSearch <: AbstractExploreStrategy end
struct BestDualBoundStrategy <: AbstractBestFirstSearch end

"Generic implementation of the tree search algorithm for a given explore strategy."
function tree_search(s::AbstractExploreStrategy, space, env, input)
    @warn "tree_search(::$(typeof(s)), ::$(typeof(space)), ::$(typeof(env)), ::$(typeof(input))) not implemented."
    return nothing
end

function tree_search(::DepthFirstStrategy, space, env, input)
    root_node = new_root(space, input)
    stack = Stack{typeof(root_node)}()
    push!(stack, root_node)
    while !isempty(stack) && !stop(space, stack)
        current = pop!(stack)
        for child in children(space, current, env, stack)
            push!(stack, child)
        end
    end
    return tree_search_output(space, stack)
end

function tree_search(strategy::AbstractBestFirstSearch, space, env, input)
    root_node = new_root(space, input)
    pq = PriorityQueue{typeof(root_node), Float64}()
    enqueue!(pq, root_node, get_priority(strategy, root_node))
    while !isempty(pq) && !stop(space, pq)
        current = dequeue!(pq)
        for child in children(space, current, env, pq)
            enqueue!(pq, child, get_priority(strategy, child))
        end
    end
    return tree_search_output(space, pq)
end