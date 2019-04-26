/**
 * Simple Todo application example using ConboJS with ES5 syntax
 * 
 * We've put all the code into a single file For demonstration purposes,
 * but in your own projects we recommend splitting your code into a
 * more sensible class structure.
 * 
 * @author	Neil Rackett
 */
conbo('conbo.example.todo', function(undefined)
{
	'use strict';
	
	var ns = this;
	
	var ENTER_KEY = 13;
	var ESC_KEY = 27;
	
	/**
	 * Todo Model
	 * Our basic **Todo** model has `title` and `completed` attributes.
	 */
	ns.TodoModel = conbo.Hash.extend
	({
		// Default values
		defaults: 
		{
			title: '',
			completed: false
		},
		
		// Toggle the `completed` state of this todo item.
		toggle: function() 
		{
			this.completed = !this.completed;
		}
	});
	
	/**
	 * Todo List
	 * Collection of todos saved in localStorage
	 */
	ns.TodoList = conbo.LocalList.extend
	({
		/**
		 * The Conbo.js class to use for this items in this list
		 */
		itemClass: ns.TodoModel,
		
		/**
		 * Filter down the list of all todo items that are finished.
		 */
		get completed() 
		{
			return this.filter(function(todo) 
			{
				return todo.completed;
			});
		},
		
		/**
		 * Filter down the list to only todo items that are still not finished.
		 */
		get remaining()
		{
			return this.without.apply(this, this.completed);
		},
		
		/**
		 * Remove completed items
		 */
		removeCompleted: function()
		{
			for (var i=0; i<this.length; i++)
			{
				if (this[i].completed)
				{
					this.splice(i--, 1);
				}
			}
		}
		
	});
	
	/**
	 * Todo Content
	 * 
	 * The central event bus, data injector and defender against the
	 * evils of global variables
	 */
	ns.TodoContext = conbo.Context.extend
	({
		/**
		 * Initialize the context by creating a context wide Todos Collection
		 * and filter model that can be automatically injected into other classes,
		 * and kick off the router and history
		 */
		initialize: function()
		{
			this.mapSingleton('todoList', ns.TodoList, {name:'conbo-todo-example'})
				.mapSingleton('filterModel', conbo.Hash, {source:{filter:undefined}})
				.mapSingleton('router', ns.TodoRouter, this)
				;
		}
	});
	
	/**
	 * Todo Item View
	 * The DOM element for a todo item...
	 */
	ns.TodoItemRenderer = conbo.ItemRenderer.extend
	({
		/**
		 * These will automatically be injected
		 */
		filterModel: undefined,
		todoList: undefined,
		
		/**
		 * This View is a list item
		 */
		tagName:  'li',
		
		/**
		 * The CSS class(es) to apply to this item  
		 */
		className: 'view',
		
		/**
		 * Is this item currently being edited?
		 */
		editing: false,

		/**
		 * The TodoView listens for changes to its model and re-renders automatically
		 */
		initialize: function() 
		{
			this.bindAll();

			// Prevent change events refreshing the list
			this.data.addEventListener('change', function(event) {
				event.stopImmediatePropagation();
			}, this, 9999);
		},

		/**
		 * Toggle the `"completed"` state of the model.
		 */
		toggleCompleted: function()
		{
			this.data.toggle();
		},
		
		/**
		 * Switch this view into `"editing"` mode, displaying the input field.
		 */
		edit: function() 
		{
			this.prevTitle = this.data.title;
			this.editing = true;
		},
		
		/**
		 * Close the `"editing"` mode, saving changes to the todo.
		 */
		close: function() 
		{
			this.data.title = this.data.title.trim();

			/**
			 * We don't want to handle blur events from an item that is no
			 * longer being edited. Relying on the CSS class here has the
			 * benefit of us not having to maintain state in the DOM and the
			 * JavaScript logic.
			 */
			if (!this.editing)
			{
				return;
			}
			
			if (!this.data.title)
			{
				this.clear();
			}

			this.editing = false;
		},
		
		/**
		 * If you hit `enter`, we're through editing the item.
		 */
		updateOnEnter: function(e) 
		{
			if (e.which === ENTER_KEY) 
			{
				this.close();
			}
		},
		
		/**
		 * If you're pressing `escape` we revert your change by simply leaving
		 * the `editing` state.
		 */
		revertOnEscape: function(e)
		{
			if (e.which === ESC_KEY)
			{
				this.data.title = this.prevTitle;
				this.editing = false;
			}
		},

		/**
		 * Remove the item, destroy the model from *localStorage* and delete its view.
		 */
		clear: function() 
		{
			this.todoList.splice(this.todoList.indexOf(this.data), 1);
		}
	});

	/**
	 * The Application
	 * This app's top level UI container
	 */
	ns.TodoApplication = conbo.Application.extend
	({
		namespace: ns,
		contextClass: ns.TodoContext,
		
		/**
		 * Values that are registered in the context and undefined in classes
		 * are automatically injected
		 */
		todoList: undefined,
		filterModel: undefined,
		
		/**
		 * How many todo items have been completed?
		 */
		completed: 0,
		
		/**
		 * How many todo items are remaining?
		 */
		remaining: 0,
		
		/**
		 * Are all items checked?
		 */
		allChecked: false,
		
		/**
		 * At initialization we bind to the relevant events on the `Todos`
		 * collection, when items are added or changed. Kick things off by
		 * loading any pre-existing todos that might be saved in *localStorage*.
		 */
		initialize: function() 
		{
			this.bindAll();
			
			this.todoList.addEventListener('change', this.updateStats, this);
			this.filterModel.addEventListener('change:filter', this.refresh, this);
			
			this.bindAll()
				.updateStats()
				;
		},
		
		refresh: function()
		{
			this.filterClasses = 'filter-'+(this.filterModel.filter || 'all');
			this.dispatchChange('todoList');
		},
		
		/**
		 * Re-rendering the App just means refreshing the statistics -- the rest
		 * of the app doesn't change.
		 */
		updateStats: function(event)
		{
			this.completed = this.todoList.completed.length;
			this.remaining = this.todoList.remaining.length;
			
			if (this.todoList.length) 
			{
				this.mainVisible = true;
				this.footerVisible = true;
			}
			else
			{
				this.mainVisible = false;
				this.footerVisible = false;
			}
			
			this.allChecked = !this.remaining;
		},
		
		/**
		 * Parser function for bound value
		 */
		itemOrItems: function(value)
		{
			return value == 1 ? 'item' : 'items';
		},
		
		todoFilter: function(todo)
		{
			switch (this.filterModel.filter)
			{
				case 'active':
					return this.todoList.remaining;
					
				case 'completed':
					return this.todoList.completed;
					
				default:
					return this.todoList;
			}
		},
		
		/**
		 * If you hit return in the main input field, create new **Todo** model,
		 * persisting it to *localStorage*.
		 */
		createOnEnter: function(e) 
		{
			var input = e.target;
			var title = input.value.trim();
			
			if (e.which === ENTER_KEY && title)
			{
				var todo = new ns.TodoModel({source:{title:title}});
				
				this.todoList.push(todo);
				input.value = '';
			}
		},
		
		/**
		 * Clear all completed todo items, destroying their models.
		 */
		clearCompleted: function() 
		{
			this.todoList.removeCompleted();
		},

		toggleAllComplete: function() 
		{
			var completed = this.allChecked;
			
			this.todoList.forEach(function(todo) 
			{
				todo.completed = completed;
			});
		}
	});
	
	/**
	 * Todo Router
	 */
	ns.TodoRouter = conbo.Router.extend
	({
		/**
		 * Our context wide filter model will automatically be 
		 * injected by the context
		 */
		filterModel: undefined,
		todoList: undefined,
		
		routes: 
		{
			'*filter': 'setFilter'
		},
		
		initialize: function(options)
		{
			this.start();
		},
		
		setFilter: function(param) 
		{
			this.filterModel.filter = param || '';
		}
	});
	
});