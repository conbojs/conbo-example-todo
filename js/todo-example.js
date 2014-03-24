/**
 * Simple Todo application example using Conbo.js framework's automatic 
 * data binding features.
 * 
 * We've put all the code into a single file For demonstration purposes,
 * but in your own projects we recommend splitting your code into a
 * more sensible file/folder structure.
 * 
 * **This example app works, but is still a work in progress**
 * 
 * @author	Neil Rackett
 */
(function(window, document, conbo, $, _, undefined)
{
	'use strict';
	
	var app = {},
		ENTER_KEY = 13,
		ESC_KEY = 27;
	
	/**
	 * Todo Model
	 * Our basic **Todo** model has `title` and `completed` attributes.
	 */
	app.TodoModel = conbo.Model.extend
	({
		// Default values
		defaults: 
		{
			title: '',
			completed: false
		},
		
		// Toggle the `completed` state of this todo item.
		toggle: function () 
		{
			this.save({completed: this.get('completed')});
		}
	});
	
	/**
	 * Todo Collection
	 * Collection of todos backed by localStorage instead of a remote server.
	 */
	app.TodoCollection = conbo.Collection.extend
	({
		/**
		 * The Conbo.js class to use for this collections models
		 */
		model: app.TodoModel,
		
		/**
		 * Save all of the todo items in local storage
		 */
		localStorage: new conbo.LocalStorage('todos-conbo'),
		
		/**
		 * Filter down the list of all todo items that are finished.
		 */
		completed: function () 
		{
			return this.filter(function(todo) 
			{
				return todo.get('completed');
			});
		},
		
		/**
		 * Filter down the list to only todo items that are still not finished.
		 */
		remaining: function ()
		{
			return this.without.apply(this, this.completed());
		},

		/**
		 * We keep the Todos in sequential order, despite being saved by unordered
		 * GUID in the database. This generates the next order number for new items.
		 */
		nextOrder: function () 
		{
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},
		
		/**
		 * Todos are sorted by their original insertion order.
		 */
		comparator: function (todo) 
		{
			return todo.get('order');
		}
	});
	
	/**
	 * Todo Content
	 * 
	 * The central event bus, data injector and defender against the
	 * evils of global variables
	 */
	app.TodoContext = conbo.Context.extend
	({
		/**
		 * Initialize the context by creating a context wide Todos Collection
		 * and filter model that can be automatically injected into other classes,
		 * and kick off the router and history
		 */
		initialize: function()
		{
			this.mapSingleton('todoCollection', app.TodoCollection);
			this.mapSingleton('filterModel', conbo.Model);
			
			new app.TodoRouter(this.addTo())
			conbo.history.start();
		}
	});
	
	/**
	 * Todo Item View
	 * The DOM element for a todo item...
	 */
	app.TodoItemView = conbo.View.extend
	({
		/**
		 * Context wide filter model will be automatically injected
		 */
		filterModel: undefined,
		
		/**
		 * This View is a list item
		 */
		tagName:  'li',

		/**
		 * Cache the template function for a single item.
		 */
		template: $('#item-template').html(),
		
		/**
		 * The TodoView listens for changes to its model, re-rendering. Since
		 * there's a one-to-one correspondence between a **Todo** and a
		 * **TodoView** in this app, we set a direct reference on the model for
		 * convenience.		 
		 */
		initialize: function () 
		{
			this.proxyAll();
			
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
			this.model.on('visible', this.toggleVisible, this);
		},
		
		/**
		 * Render the titles of the todo item.
		 */
		render: function () 
		{
			this.toggleVisible();
			this.$input = this.$('.edit');
			
			return this;
		},
		
		toggleVisible: function ()
		{
			this.$el.toggleClass('hidden', this.isHidden());
		},
		
		isHidden: function () 
		{
			var isCompleted = this.model.get('completed');
			
			return (// hidden cases only
				(!isCompleted && this.filterModel.get('filter') === 'completed') ||
				(isCompleted && this.filterModel.get('filter') === 'active')
			);
		},

		/**
		 * Toggle the `"completed"` state of the model.
		 */
		toggleCompleted: function ()
		{
			this.model.toggle();
		},
		
		/**
		 * Switch this view into `"editing"` mode, displaying the input field.
		 */
		edit: function () 
		{
			this.$el.addClass('editing');
			this.$input.focus();
		},

		/**
		 * Close the `"editing"` mode, saving changes to the todo.
		 */
		close: function () 
		{
			var value = this.$input.val();
			var trimmedValue = value.trim();

			/**
			 * We don't want to handle blur events from an item that is no
			 * longer being edited. Relying on the CSS class here has the
			 * benefit of us not having to maintain state in the DOM and the
			 * JavaScript logic.
			 */
			if (!this.$el.hasClass('editing')) 
			{
				return;
			}
			
			if (trimmedValue) 
			{
				this.model.save({title:trimmedValue});
			} 
			else 
			{
				this.clear();
			}

			this.$el.removeClass('editing');
		},
		
		/**
		 * If you hit `enter`, we're through editing the item.
		 */
		updateOnEnter: function (e) 
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
		revertOnEscape: function (e) 
		{
			if (e.which === ESC_KEY)
			{
				this.$el.removeClass('editing');
			}
		},

		/**
		 * Remove the item, destroy the model from *localStorage* and delete its view.
		 */
		clear: function () 
		{
			this.model.destroy();
		}
	});

	/**
	 * The Application
	 * This app's top level UI container
	 */
	app.TodoApplication = conbo.Application.extend
	({
		contextClass: app.TodoContext,
		
		/**
		 * Todo Collection
		 * 
		 * Values that are registered in the context and undefined in classes
		 * are automatically injected
		 */
		todoCollection: undefined,
		
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
		 * Our template for the line of statistics at the bottom of the app.
		 */
		statsTemplate: $('#stats-template').html(),
		
		/**
		 * Are all items checked?
		 */
		allChecked: false,
		
		/**
		 * At initialization we bind to the relevant events on the `Todos`
		 * collection, when items are added or changed. Kick things off by
		 * loading any preexisting todos that might be saved in *localStorage*.
		 */
		initialize: function () 
		{
			this.proxyAll();
			
			this.$input = this.$('#new-todo');
			this.$list = $('#todo-list');
			
			this.todoCollection.on('add', this.todoCollection_add, this);
			this.todoCollection.on('reset', this.todoCollection_reset, this);
			this.todoCollection.on('change:completed', this.todoCollection_changeCompleted, this);
			this.todoCollection.on('all', this.render, this);
			
			// Suppresses 'add' events with {reset: true} and prevents the app view
			// from being re-rendered for every model. Only renders when the 'reset'
			// event is triggered at the end of the fetch.
			this.todoCollection.fetch({reset: true});
			
			this.filterModel.on('change:filter', this.filterModel_change, this);
		},
		
		/**
		 * Re-rendering the App just means refreshing the statistics -- the rest
		 * of the app doesn't change.
		 */
		render: function (event)
		{
			this.set('completed', this.todoCollection.completed().length)
				.set('remaining', this.todoCollection.remaining().length);
			
			if (!!this.todoCollection.length) 
			{
				this.set('mainVisible', true)
					.set('footerVisible', true);
				
				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (this.filterModel.get('filter') || '') + '"]')
					.addClass('selected');
			}
			else
			{
				this.set('mainVisible', false)
					.set('footerVisible', false);
			}
			
			this.set('allChecked', !this.remaining);
		},
		
		/**
		 * Parser function for bound value
		 */
		itemOrItems: function(value)
		{
			return value == 1 ? 'item' : 'items';
		},
		
		todoCollection_add: function(event)
		{
			this.addOne(event.model);
		},
		
		todoCollection_reset: function(event)
		{
			this.addAll();
		},
		
		todoCollection_changeCompleted: function(event)
		{
			this.filterOne(event.model);
		},
		
		/**
		 * Add a single todo item to the list by creating a view for it, and
		 * appending its element to the `<ul>`.
		 */
		addOne: function (todo) 
		{
			var view = new app.TodoItemView(this.context.addTo({model: todo}));			
			this.$list.append(view.el);
		},
		
		/**
		 * Add all items in the **Todos** collection at once.
		 */
		addAll: function () 
		{
			this.$list.html('');
			this.todoCollection.each(this.addOne, this);
		},
		
		filterOne: function (todo) 
		{
			todo.trigger('visible');
		},
		
		filterModel_change: function(event)
		{
			this.filterAll();
		},
		
		filterAll: function () 
		{
			this.todoCollection.each(this.filterOne, this);
		},
		
		/**
		 * Generate the attributes for a new Todo item.
		 */
		newAttributes: function () 
		{
			return {
				title: this.$input.val().trim(),
				order: this.todoCollection.nextOrder(),
				completed: false
			};
		},

		/**
		 * If you hit return in the main input field, create new **Todo** model,
		 * persisting it to *localStorage*.
		 */
		createOnEnter: function (e) 
		{
			if (e.which === ENTER_KEY && this.$input.val().trim()) 
			{
				this.todoCollection.create(this.newAttributes());
				this.$input.val('');
			}
		},
		
		/**
		 * Clear all completed todo items, destroying their models.
		 */
		clearCompleted: function () 
		{
			_.invoke(this.todoCollection.completed(), 'destroy');
			return false;
		},

		toggleAllComplete: function () 
		{
			var completed = this.allChecked;
			
			this.todoCollection.each(function(todo) 
			{
				todo.save({completed:completed});
			});
		}
	});
	
	/**
	 * Todo Router
	 */
	app.TodoRouter = conbo.Router.extend
	({
		/**
		 * Our context wide Todo Collection will automatically be 
		 * injected by the context
		 */
		todoCollection: undefined,
		
		/**
		 * ... and so will our filter model
		 */
		filterModel: undefined,
		
		routes: 
		{
			'*filter': 'setFilter'
		},
		
		setFilter: function (param) 
		{
			// Set the current filter to be used
			this.filterModel.set('filter', param || '');
		}
	});
	
	new app.TodoApplication({namespace:app});
	
})(window, document, conbo, $, _);