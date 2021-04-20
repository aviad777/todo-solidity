
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
        App.account = accounts[0]

    },
    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');

        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(window.ethereum);
        App.todoList = await App.contracts.TodoList.deployed();
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