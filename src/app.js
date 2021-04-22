
App = {
    contracts: {},
    loading: false,
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()

    },

    loadWeb3: async () => {
        // if (typeof web3 !== 'undefined') {
        //     App.web3Provider = web3.currentProvider;
        //     window.web3 = new Web3(web3.currentProvider);
        // } else {
        //     // If no injected web3 instance is detected, fallback to Ganache.
        //     App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:8545');
        //     window.web3 = new Web3(App.web3Provider);
        // }
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('no etherum browser detected.')
        }
    },
    loadAccount: async () => {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        web3.eth.defaultAccount = accounts[0]
        App.account = web3.eth.defaultAccount

    },
    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        console.log('contracts:', App.contracts);
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(window.ethereum);
        App.contracts.TodoList.defaults({
            from: App.account
        })
        App.todoList = await App.contracts.TodoList.deployed();
        console.log('contracts:', App.contracts);

        console.log('app todolist: ', App.todoList);
    },

    render: async () => {
        if (App.loading) {
            return
        }
        // update app loading state
        App.setLoading(true)
        $('#account').html(App.account);
        await App.renderTasks()
        App.setLoading(false)
    },
    createTask: async () => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (!boolean) {
            loader.hide()
            content.show()
        } else {
            loader.show()
            content.hide()
        }
    },
    renderTasks: async () => {
        const taskCount = await App.todoList.taskCount()
        console.log('taskCount:', taskCount);
        const $taskTemplate = $('.taskTemplate')
        for (var i = 1; i <= taskCount; i++) {
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]
            const $newTaskTemplate = $taskTemplate.clone()

            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleCompleted)

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate);
            } else {
                $('#taskList').append($newTaskTemplate);
            }
            $newTaskTemplate.show();
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load(window.ethereum)
    })
})