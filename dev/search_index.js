var documenterSearchIndex = {"docs":
[{"location":"dev/reformulation/#","page":"Reformulation","title":"Reformulation","text":"CurrentModule = Coluna.MathProg\nDocTestSetup = quote\n    using Coluna.MathProg\nend","category":"page"},{"location":"dev/reformulation/#Reformulation-1","page":"Reformulation","title":"Reformulation","text":"","category":"section"},{"location":"dev/reformulation/#","page":"Reformulation","title":"Reformulation","text":"Reformulation\ngetobjsense\ngetmaster\nadd_dw_pricing_sp!\nadd_benders_sep_sp!\nget_dw_pricing_sps\nget_benders_sep_sps\nget_dw_pricing_sp_ub_constrid\nget_dw_pricing_sp_lb_constrid","category":"page"},{"location":"dev/reformulation/#Coluna.MathProg.Reformulation","page":"Reformulation","title":"Coluna.MathProg.Reformulation","text":"Reformulation is a representation of a formulation which is solved by Coluna  using a decomposition approach.\n\nReformulation()\n\nConstruct an empty Reformulation.\n\n\n\n\n\n","category":"type"},{"location":"dev/reformulation/#Coluna.MathProg.getobjsense","page":"Reformulation","title":"Coluna.MathProg.getobjsense","text":"Returns the objective function sense of Formulation form.\n\n\n\n\n\ngetobjsense(reformulation)\n\nReturn the objective sense of the master problem of the reformulation. If the master problem has not been defined, it throws an error.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.getmaster","page":"Reformulation","title":"Coluna.MathProg.getmaster","text":"getmaster(reformulation)\n\nReturn the formulation of the master problem.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.add_dw_pricing_sp!","page":"Reformulation","title":"Coluna.MathProg.add_dw_pricing_sp!","text":"add_dw_pricing_sp!(reformulation, abstractmodel)\n\nAdd a Dantzig-Wolfe pricing subproblem in the reformulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.add_benders_sep_sp!","page":"Reformulation","title":"Coluna.MathProg.add_benders_sep_sp!","text":"add_benders_sep_sp!(reformulation, abstractmodel)\n\nAdd a Benders separation subproblem in the reformulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.get_dw_pricing_sps","page":"Reformulation","title":"Coluna.MathProg.get_dw_pricing_sps","text":"get_dw_pricing_sps(reformulation)\n\nReturn a Dict{FormId, AbstractModel} containing all Dabtzig-Wolfe pricing subproblems of the reformulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.get_benders_sep_sps","page":"Reformulation","title":"Coluna.MathProg.get_benders_sep_sps","text":"get_benders_sep_sps(reformulation)\n\nReturn a Dict{FormId, AbstractModel} containing all Benders separation subproblems of the reformulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.get_dw_pricing_sp_ub_constrid","page":"Reformulation","title":"Coluna.MathProg.get_dw_pricing_sp_ub_constrid","text":"get_dw_pricing_sp_ub_constrid(reformulation, spid::FormId)\n\nReturn the ConstrId of the upper bounded convexity constraint of Dantzig-Wolfe pricing subproblem with id spid.\n\n\n\n\n\n","category":"function"},{"location":"dev/reformulation/#Coluna.MathProg.get_dw_pricing_sp_lb_constrid","page":"Reformulation","title":"Coluna.MathProg.get_dw_pricing_sp_lb_constrid","text":"get_dw_pricing_sp_lb_constrid(reformulation, spid::FormId)\n\nReturn the ConstrId of the lower bounded convexity constraint of Dantzig-Wolfe pricing subproblem with id spid.\n\n\n\n\n\n","category":"function"},{"location":"user/callbacks/#Callbacks-1","page":"Callbacks","title":"Callbacks","text":"","category":"section"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"Callbacks are functions defined by the user that allow him to take over part of the default  algorithm.  The more classical callbacks in a branch-and-price solver are:","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"Pricing callback that takes over the procedure to determine whether the current master LP    solution is optimum or produce an entering variable with negative reduced cost\nSeparation callback that takes over the procedure to determine whether the current master   LP solution is feasible or produce a valid problem constraint that is violated\nBranching callback that take over the procedure to determine whether the current master    LP solution is integer or produce a valid branching disjunctive constraint that rules out    the current fractional solution.","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"In this page, we use following aliases : ","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"const BD = BlockDecomposition\nconst MOI = MathOptInterface","category":"page"},{"location":"user/callbacks/#Pricing-callback-1","page":"Callbacks","title":"Pricing callback","text":"","category":"section"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"The pricing callback let you define how to solve the subproblems of a Dantzig-Wolfe  decomposition to generate a new entering column in the master program.  This callback is usefull when you know an efficient algorithm to solve the subproblems,  i.e. an algorithm better than solving the subproblem with a MIP solver.","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"Let us see an example with the generalized assignment problem for which the JuMP model takes the form:","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"model = BlockModel(optimizer, bridge_constraints = false)\n\n@axis(M, 1:nb_machines)\nJ = 1:nb_jobs\n\n# JuMP model\n@variable(model, x[m in M, j in J], Bin)\n@constraint(model, cov[j in J], sum(x[m,j] for m in M) == 1)\n@objective(model, Min, sum(c[m,j]*x[m,j] for m in M, j in J))\n@dantzig_wolfe_decomposition(model, dwdec, M)","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"where as you can see, we omitted the knapsack constraints.  These constraints are implicitly defined by the algorithm called in the pricing callback.","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"Assume we have the following method that solves efficienlty a knapsack problem:","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"solve_knp(job_costs, lb_jobs, ub_jobs, capacity)","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"where ","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"job_costs is an array that contains the cost of each job\nlb_jobs is an array where the j-th entry equals 1 if it is mandatory to put job j in the knapsack\nub_jobs is an array where the j-th entry equals 0 if job j cannot be put in the knapsack\ncapacity is a real that is equal to the capacity of the knapsack","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"The pricing callback is a function. It takes as argument cbdata which is a data structure that allows the user to interact with the solver within the pricing callback.","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"function my_pricing_callback(cbdata)\n    # Retrieve the index of the subproblem (it will be one of the values in M)\n    cur_machine = BD.callback_spid(cbdata, model)\n\n    # Retrieve reduced costs of subproblem variables\n    red_costs = [BD.callback_reduced_cost(cbdata, x[cur_machine, j]) for j in J]\n\n    # Retrieve current bounds of subproblem variables\n    lb_x = [BD.callback_lb(cbdata, x[cur_machine, j]) for j in J]\n    ub_x = [BD.callback_ub(cbdata, x[cur_machine, j]) for j in J]\n\n    # Solve the knapsack with a custom algorithm\n    jobs_assigned_to_cur_machine = solve_knp(red_costs, lb_x, ub_x, Q[cur_machine])\n\n    # Create the solution (send only variables with non-zero values)\n    sol_vars = [x[cur_machine, j] for j in jobs_assigned_to_cur_machine]\n    sol_vals = [1.0 for j in jobs_assigned_to_cur_machine]\n    sol_cost = sum(red_costs[j] for j in jobs_assigned_to_cur_machine)\n\n    # Submit the solution to the subproblem to Coluna\n    MOI.submit(model, BD.PricingSolution(cbdata), sol_cost, sol_vars, sol_vals)\n    return\nend","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"The pricing callback is provided to Coluna using the keyword solver in the method  specify!.","category":"page"},{"location":"user/callbacks/#","page":"Callbacks","title":"Callbacks","text":"master = BD.getmaster(dwdec)\nsubproblems = BD.getsubproblems(dwdec)\nBD.specify!.(subproblems, lower_multiplicity = 0, solver = my_pricing_callback)","category":"page"},{"location":"dev/formulation/#","page":"Formulation","title":"Formulation","text":"CurrentModule = Coluna.MathProg\nDocTestSetup = quote\n    using Coluna.MathProg\nend","category":"page"},{"location":"dev/formulation/#Formulation-1","page":"Formulation","title":"Formulation","text":"","category":"section"},{"location":"dev/formulation/#Attributes-of-variables-and-constraints-1","page":"Formulation","title":"Attributes of variables and constraints","text":"","category":"section"},{"location":"dev/formulation/#","page":"Formulation","title":"Formulation","text":"Performance note : use a variable or a constraint rather than its id.","category":"page"},{"location":"dev/formulation/#","page":"Formulation","title":"Formulation","text":"getperencost\ngetcurcost\nsetcurcost!\ngetperenlb\ngetcurlb\nsetcurlb!\ngetperenub\ngetcurub\nsetcurub!\ngetperenrhs\ngetcurrhs\nsetcurrhs!\ngetperenkind\ngetcurkind\nsetcurkind!\ngetperensense\ngetcursense\nsetcursense!\ngetperenincval\ngetcurincval\nsetcurincval!\nisperenactive\niscuractive\nactivate!\ndeactivate!\nisexplicit\ngetname","category":"page"},{"location":"dev/formulation/#Coluna.MathProg.getperencost","page":"Formulation","title":"Coluna.MathProg.getperencost","text":"getperencost(formulation, variable)\ngetperencost(formulation, varid)\n\nReturn the cost as defined by the user of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurcost","page":"Formulation","title":"Coluna.MathProg.getcurcost","text":"getcurcost(formulation, variable)\ngetcurcost(formulation, varid)\n\nReturn the current cost of the variable in the formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurcost!","page":"Formulation","title":"Coluna.MathProg.setcurcost!","text":"setcurcost!(formulation, varid, cost::Float64)\nsetcurcost!(formulation, variable, cost::Float64)\n\nSet the current cost of variable in the formulation. If the variable is active and explicit, this change is buffered before application to the  subsolver.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperenlb","page":"Formulation","title":"Coluna.MathProg.getperenlb","text":"getperenlb(formulation, varid)\ngetperenlb(formulation, var)\n\nReturn the lower bound as defined by the user of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurlb","page":"Formulation","title":"Coluna.MathProg.getcurlb","text":"getcurlb(formulation, varid)\ngetcurlb(formulation, var)\n\nReturn the current lower bound of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurlb!","page":"Formulation","title":"Coluna.MathProg.setcurlb!","text":"setcurlb!(formulation, varid, lb::Float64)\nsetcurlb!(formulation, var, lb::Float64)\n\nSet the current lower bound of a variable in a formulation. If the variable is active and explicit, change is buffered before application to the subsolver.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperenub","page":"Formulation","title":"Coluna.MathProg.getperenub","text":"getperenub(formulation, varid)\ngetperenub(formulation, var)\n\nReturn the upper bound as defined by the user of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurub","page":"Formulation","title":"Coluna.MathProg.getcurub","text":"getcurub(formulation, varid)\ngetcurub(formulation, var)\n\nReturn the current upper bound of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurub!","page":"Formulation","title":"Coluna.MathProg.setcurub!","text":"setcurub!(formulation, varid, ub::Float64)\nsetcurub!(formulation, var, ub::Float64)\n\nSet the current upper bound of a variable in a formulation. If the variable is active and explicit, change is buffered before application to the subsolver.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperenrhs","page":"Formulation","title":"Coluna.MathProg.getperenrhs","text":"getperenrhs(formulation, constraint)\ngetperenrhs(formulation, constrid)\n\nReturn the right-hand side as defined by the user of a constraint in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurrhs","page":"Formulation","title":"Coluna.MathProg.getcurrhs","text":"getcurrhs(formulation, constraint)\ngetcurrhs(formulation, constrid)\n\nReturn the current right-hand side of a constraint in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurrhs!","page":"Formulation","title":"Coluna.MathProg.setcurrhs!","text":"setcurrhs(formulation, constraint, rhs::Float64)\nsetcurrhs(formulation, constrid, rhs::Float64)\n\nSet the current right-hand side of a constraint in a formulation.  If the constraint is active and explicit, this change is buffered before application to the subsolver.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperenkind","page":"Formulation","title":"Coluna.MathProg.getperenkind","text":"getperenkind(formulation, varconstr)\ngetperenkind(formulation, varconstrid)\n\nReturn the kind as defined by the user of a variable or a constraint in a formulation.\n\nKinds of variable (enum VarKind) are Continuous, Binary, or Integ.\n\nKinds of a constraint (enum ConstrKind) are : \n\nEssential when the constraint structures the problem\nFacultative when the constraint does not structure the problem\nSubSystem (to do)\n\nThe kind of a constraint cannot change.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurkind","page":"Formulation","title":"Coluna.MathProg.getcurkind","text":"getcurkind(formulation, variable)\ngetcurkind(formulation, varid)\n\nReturn the current kind of a variable in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurkind!","page":"Formulation","title":"Coluna.MathProg.setcurkind!","text":"setcurkind!(formulation, variable, kind::VarKind)\nsetcurkind!(formulation, varid, kind::VarKind)\n\nSet the current kind of a variable in a formulation. If the variable is active and explicit, this change is buffered before application to the subsolver\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperensense","page":"Formulation","title":"Coluna.MathProg.getperensense","text":"getperensense(formulation, varconstr)\ngetperensense(formulation, varconstrid)\n\nReturn the sense as defined by the user of a variable or a constraint in a formulation.\n\nSenses or a variable are (enum VarSense)  Positive, Negative, and Free. Senses or a constraint are (enum ConstrSense) Greater, Less, and Equal.\n\nThe perennial sense of a variable depends on its perennial bounds.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcursense","page":"Formulation","title":"Coluna.MathProg.getcursense","text":"getcursense(formulation, varconstr)\ngetcursense(formulation, varconstrid)\n\nReturn the current sense of a variable or a constraint in a formulation. The current sense of a variable depends on its current bounds.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcursense!","page":"Formulation","title":"Coluna.MathProg.setcursense!","text":"setcursense!(formulation, constr, sense::ConstrSense)\nsetcursense!(formulation, constrid, sense::ConstrSense)\n\nSet the current sense of a constraint in a formulation.\n\nThis method is not applicable to variables because the sense of a variable depends on its bounds.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getperenincval","page":"Formulation","title":"Coluna.MathProg.getperenincval","text":"getperenincval(formulation, varconstrid)\ngetperenincval(formulation, varconstr)\n\nReturn the incumbent value as defined by the user of a variable or a constraint in a formulation.  The incumbent value is ?\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getcurincval","page":"Formulation","title":"Coluna.MathProg.getcurincval","text":"getcurincval(formulation, varconstrid)\ngetcurincval(formulation, varconstr)\n\nReturn the current incumbent value of a variable or a constraint in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.setcurincval!","page":"Formulation","title":"Coluna.MathProg.setcurincval!","text":"setcurincval!(formulation, varconstrid, value::Real)\n\nSet the current incumbent value of a variable or a constraint in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.isperenactive","page":"Formulation","title":"Coluna.MathProg.isperenactive","text":"isperenactive(formulation, varconstrid)\nisperenactive(formulation, varconstr)\n\nReturn true if the variable or the constraint is active in the formulation; false otherwise. A variable (or a constraint) is active if it is used in the formulation. You can fake the  deletion of the variable by deativate it. This allows you to keep the variable if you want  to reactivate it later.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.iscuractive","page":"Formulation","title":"Coluna.MathProg.iscuractive","text":"iscuractive(formulation, varconstrid)\niscuractive(formulation, varconstr)\n\nReturn true if the variable or the constraint is currently active; false otherwise.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.activate!","page":"Formulation","title":"Coluna.MathProg.activate!","text":"activate!(formulation, varconstrid)\nactivate!(formulation, varconstr)\n\nActivate a variable or a constraint in a formulation.\n\nactivate!(formulation, function)\n\nIt is also possible to activate variables and constraints of a formulation such that  function(varconstrid) returns true.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.deactivate!","page":"Formulation","title":"Coluna.MathProg.deactivate!","text":"deactivate!(formulation, varconstrid)\ndeactivate!(formulation, varconstr)\n\nDeactivate a variable or a constraint in a formulation.\n\ndeactivate!(formulation, function)\n\nIt is also possible to deactivate variables and constraints such that  function(varconstrid) returns true.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.isexplicit","page":"Formulation","title":"Coluna.MathProg.isexplicit","text":"isexplicit(formulation, varconstr)\nisexplicit(formulation, varconstrid)\n\nReturn true if a variable or a constraint is explicit in a formulation; false otherwise.\n\n\n\n\n\n","category":"function"},{"location":"dev/formulation/#Coluna.MathProg.getname","page":"Formulation","title":"Coluna.MathProg.getname","text":"getname(formulation, varconstr)\ngetname(formulation, varconstrid)\n\nReturn the name of a variable or a constraint in a formulation.\n\n\n\n\n\n","category":"function"},{"location":"user/start/#Quick-start-1","page":"Getting started","title":"Quick start","text":"","category":"section"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"This quick start guide introduces the main features of Coluna through the example of the Generalized Assignement Problem.","category":"page"},{"location":"user/start/#Problem-1","page":"Getting started","title":"Problem","text":"","category":"section"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Consider a set of machines M = 1:nb_machines and a set of jobs J = 1:nb_jobs. A machine m has a resource capacity Q_m .  A job j assigned to a machine m has a cost c_mj and consumes w_mj resource units of the machine m.  The goal is to minimize the sum of job costs while assigning each job to a machine and not  exceeding the capacity of each machine.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Let x_mj equal to one if job j is assigned to machine m; 0 otherwise. The problem has the original formulation:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"beginalignedat4 \ntextGAP equiv min mathrlapsum_m in M c_mj x_mj  \ntextst  sum_m in M x_mj = 1  quad j in J \n sum_j in J w_mj x_mj leq Q_m  quad  quad m in M  \n x_mj  in 01  m in M j in J\nendalignedat","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"In this tutorial, you will solve the instance below using a \"simple\" branch-and-cut-and-price algorithm:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"nb_machines = 4\nnb_jobs = 30\nc = [12.7 22.5 8.9 20.8 13.6 12.4 24.8 19.1 11.5 17.4 24.7 6.8 21.7 14.3 10.5 15.2 14.3 12.6 9.2 20.8 11.7 17.3 9.2 20.3 11.4 6.2 13.8 10.0 20.9 20.6;  19.1 24.8 24.4 23.6 16.1 20.6 15.0 9.5 7.9 11.3 22.6 8.0 21.5 14.7 23.2 19.7 19.5 7.2 6.4 23.2 8.1 13.6 24.6 15.6 22.3 8.8 19.1 18.4 22.9 8.0;  18.6 14.1 22.7 9.9 24.2 24.5 20.8 12.9 17.7 11.9 18.7 10.1 9.1 8.9 7.7 16.6 8.3 15.9 24.3 18.6 21.1 7.5 16.8 20.9 8.9 15.2 15.7 12.7 20.8 10.4;  13.1 16.2 16.8 16.7 9.0 16.9 17.9 12.1 17.5 22.0 19.9 14.6 18.2 19.6 24.2 12.9 11.3 7.5 6.5 11.3 7.8 13.8 20.7 16.8 23.6 19.1 16.8 19.3 12.5 11.0]\nw = [61 70 57 82 51 74 98 64 86 80 69 79 60 76 78 71 50 99 92 83 53 91 68 61 63 97 91 77 68 80; 50 57 61 83 81 79 63 99 82 59 83 91 59 99 91 75 66 100 69 60 87 98 78 62 90 89 67 87 65 100; 91 81 66 63 59 81 87 90 65 55 57 68 92 91 86 74 80 89 95 57 55 96 77 60 55 57 56 67 81 52;  62 79 73 60 75 66 68 99 69 60 56 100 67 68 54 66 50 56 70 56 72 62 85 70 100 57 96 69 65 50]\nQ = [1020 1460 1530 1190]","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"This model has a block structure : each knapsack constraint defines an independent block and the set-partitionning constraints couple these independent  blocks. By applying the Dantzig-Wolfe reformulation, each knapsack constraint forms a tractable subproblem and the set-partitionning constraints are handled in a master problem.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"To introduce the model, you need to load packages JuMP and BlockDecomposition. To optimize the problem, you need Coluna and a Julia package that provides a MIP solver such as GLPK.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"using JuMP, BlockDecomposition, Coluna, GLPK ","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Next you instantiate the solver and define the algorithm that you use to optimize the problem. In this case, the algorithm is a \"simple\" branch-and-cut-and-price provided by Coluna.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"coluna = optimizer_with_attributes(\n    Coluna.Optimizer,\n    \"params\" => Coluna.Params(\n        solver = Coluna.Algorithm.TreeSearchAlgorithm() # default BCP\n    ),\n    \"default_optimizer\" => GLPK.Optimizer # GLPK for the master & the subproblems\n)","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"In BlockDecomposition, an axis is the index set of subproblems.  Let M be the index set of machines; it defines an axis along which we can implement the desired decomposition. In this example, the axis M defines one knapsack subproblem for  each machine.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Jobs are not involved in the decomposition, you thus define the set J of jobs as a classic range.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"@axis(M, 1:nb_machines)\nJ = 1:nb_jobs","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"The model takes the form (argument bridge_constraints = false is mandatory because of a  bug in our interface):","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"model = BlockModel(coluna, bridge_constraints = false)\n@variable(model, x[m in M, j in J], Bin)\n@constraint(model, cov[j in J], sum(x[m, j] for m in M) >= 1)\n@constraint(model, knp[m in M], sum(w[m, j] * x[m, j] for j in J) <= Q[m])\n@objective(model, Min, sum(c[m, j] * x[m, j] for m in M, j in J))","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"You then apply a Dantzig-Wolfe decomposition along the M axis:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"@dantzig_wolfe_decomposition(model, decomposition, M)","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"where decomposition is a variable that contains information about the decomposition.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Once the decomposition is defined, you can retrieve the master and the subproblems to give additional information to the solver.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"master = getmaster(decomposition)\nsubproblems = getsubproblems(decomposition)","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"The multiplicity of a subproblem is the number of times that the same independent block  shaped by the subproblem appears in the model. This multiplicy also specifies the number of  solutions to the subproblem that can appear in the solution to the original problem. ","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"In this GAP instance, the upper multiplicity is 1 because every subproblem is different,  i.e., every machine is different and used at most once.","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"The lower multiplicity is 0 because a machine may stay unused.  The multiplicity specifications take the form:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"specify!.(subproblems, lower_multiplicity = 0, upper_multiplicity = 1)","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"The model is now fully defined. To solve it, you need to call:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"optimize!(model)","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"Finally, you can retrieve the solution to the original formulation with JuMP methods. For example:","category":"page"},{"location":"user/start/#","page":"Getting started","title":"Getting started","text":"value.(x[1,:])  # j-th position is equal to 1 if job j assigned to machine 1","category":"page"},{"location":"dev/algorithms/#","page":"Algorithms","title":"Algorithms","text":"CurrentModule = Coluna.Algorithm\nDocTestSetup = quote\n    using Coluna.Algorithm\nend","category":"page"},{"location":"dev/algorithms/#Algorithms-1","page":"Algorithms","title":"Algorithms","text":"","category":"section"},{"location":"dev/algorithms/#","page":"Algorithms","title":"Algorithms","text":"TreeSearchAlgorithm","category":"page"},{"location":"dev/algorithms/#Coluna.Algorithm.TreeSearchAlgorithm","page":"Algorithms","title":"Coluna.Algorithm.TreeSearchAlgorithm","text":"Coluna.Algorithm.TreeSearchAlgorithm(\n    conqueralg::AbstractConquerAlgorithm = ColGenConquer(),\n    dividealg::AbstractDivideAlgorithm = SimpleBranching(),\n    explorestrategy::AbstractTreeExploreStrategy = DepthFirstStrategy(),\n    maxnumnodes::Int = 100000,\n    opennodeslimit::Int = 100,\n    branchingtreefile = nothing\n)\n\nThis algorithm uses search tree to do optimization. At each node in the tree, it applies conqueralg to improve the bounds, dividealg to generate child nodes, and explorestrategy to select the next node to treat.\n\n\n\n\n\n","category":"type"},{"location":"dev/algorithms/#","page":"Algorithms","title":"Algorithms","text":"ColGenConquer","category":"page"},{"location":"dev/algorithms/#Coluna.Algorithm.ColGenConquer","page":"Algorithms","title":"Coluna.Algorithm.ColGenConquer","text":"Coluna.Algorithm.ColGenConquer(\n    colgen::ColumnGeneration = ColumnGeneration()\n    mastipheur::SolveIpForm = SolveIpForm()\n    preprocess::PreprocessAlgorithm = PreprocessAlgorithm()\n    run_mastipheur::Bool = true\n    run_preprocessing::Bool = false\n)\n\nColumn-generation based algorithm to find primal and dual bounds for a  problem decomposed using Dantzig-Wolfe paradigm. It applies colgen for the column  generation phase, masteripheur to optimize the integer restricted master.\n\n\n\n\n\n","category":"type"},{"location":"dev/algorithms/#","page":"Algorithms","title":"Algorithms","text":"ColumnGeneration\nSolveIpForm\nSolveLpForm","category":"page"},{"location":"dev/algorithms/#Coluna.Algorithm.ColumnGeneration","page":"Algorithms","title":"Coluna.Algorithm.ColumnGeneration","text":"Coluna.Algorithm.ColumnGeneration(\n    restr_master_solve_alg = SolveLpForm(get_dual_solution = true)\n    pricing_prob_solve_alg = SolveIpForm(\n        deactivate_artificial_vars = false, \n        enforce_integrality = false, \n        log_level = 2\n    ),\n    max_nb_iterations::Int = 1000\n    optimality_tol::Float64 = 1e-5\n    log_print_frequency::Int = 1\n    store_all_ip_primal_sols::Bool = false\n    redcost_tol::Float = 1e-5\n    cleanup_threshold::Int = 10000\n    cleanup_ratio::Float = 0.66\n)\n\nColumn generation algorithm. It applies restr_master_solve_alg to solve the linear  restricted master and pricing_prob_solve_alg to solve the subproblems.\n\n\n\n\n\n","category":"type"},{"location":"dev/algorithms/#Coluna.Algorithm.SolveIpForm","page":"Algorithms","title":"Coluna.Algorithm.SolveIpForm","text":"Coluna.Algorithm.SolveIpForm(\n    time_limit::Int = 600,\n    deactivate_artificial_vars = true,\n    enforce_integrality = true,\n    silent = true,\n    log_level = 0\n)\n\nSolve a mixed integer linear program.\n\n\n\n\n\n","category":"type"},{"location":"dev/algorithms/#Coluna.Algorithm.SolveLpForm","page":"Algorithms","title":"Coluna.Algorithm.SolveLpForm","text":"Coluna.Algorithm.SolveLpForm(\n    get_dual_solution = false,\n    relax_integrality = false,\n    set_dual_bound = false,\n    silent = true\n)\n\nSolve a linear program.\n\n\n\n\n\n","category":"type"},{"location":"#Introduction-1","page":"Introduction","title":"Introduction","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Coluna is a framework written in Julia to implement a decomposition approach to optimize  block structured mixed-integer programs (MIP). ","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Coluna relies on the tools of the JuliaOpt community at both ends of the problem treatment.  It uses the JuMP modeling language up front and MathOptInterface (MOI) to delegate master  and subproblems to MIP solvers. ","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"The user introduces an original MIP that model his problem using the JuMP along our specific  extension BlockDecomposition that offers a syntax to specify the problem decomposition.  Coluna reformulates the original MIP using Dantzig-Wolfe and Benders decomposition  techniques.  Then, Coluna optimizes the reformulation using the algorithm chosen by the user.","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Coluna offers a \"black-box\" implementation of the branch-and-cut-and-price algorithm:","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"The input is the set of constraints and variables of the MIP in its natural/compact formulation (formulated with JuMP or MOI). \nBlockDecomposition allows the user to provide to Coluna his instructions on the desired decomposition of the model.   The BlockDecomposition syntax allows the user to implicilty define subsystems in the MIP on which the decomposition is based.   These subsystems are described by rows and/or columns indices. This syntax is handy to test different decompositions.\nThe reformulation associated to a so-defined decomposition is automatically generated by Coluna,  without requiring any input from the user to define master columns, their reduced cost, pricing/separation problem, or Lagrangian bound.\nA default column (and cut) generation procedure is implemented.  It relies on underlying MOI optimizers to handle master and subproblems.   However, the user can define its own optimizer using pricing callbacks.\nA branching scheme that preserves the pricing problem structure is offered by default;   it runs based on priorities and directives specified by the user on the original variables;   default primal heuristics and preprocessing features are under developments.","category":"page"},{"location":"#Installation-1","page":"Introduction","title":"Installation","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Coluna is a package for Julia 1.0+","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"It requires JuMP to model the problem, BlockDecomposition to define the decomposition, and a MIP solver supported by MathOptInterface to optimize the master and the subproblems. ","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"You can install Coluna and its dependencies through the package manager of Julia by entering :","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"] add Coluna","category":"page"},{"location":"#Contributions-1","page":"Introduction","title":"Contributions","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"We welcome all contributions that help us to improve Coluna. You can suggest ways to enhance the package by talking with developers on the discord chat dedicated to Coluna, or opening an issue via the GitHub issues tracker","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Once the suggestion approved, you can open a Pull Request (PR) with the implementation of your suggestion. ","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Before requesting the review, make sure that your code follows the style guide and passes tests.","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Do no forget to update docstrings and the tests when necessary. It is very important to keep clear the goal of the PR to make the review fast. So we might close a PR that fixes two unrelated issues or more. ","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Coluna style follows the blue style guide for Julia amended by the following instruction on naming :","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Names of variables and functions are treated equally. Use names that express what the variable/function do. > Either use : lowercasenospace when the nam``is composed of three words or less with no ambiguity on words separation.\nsnake_case otherwise","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Note that the application of the style guide is a work in progress.","category":"page"},{"location":"#Acknowledgements-1","page":"Introduction","title":"Acknowledgements","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Atoptima, Mathematical Optimization Society (MOS), Région Nouvelle-Aquitaine, University of Bordeaux, and Inria","category":"page"}]
}
