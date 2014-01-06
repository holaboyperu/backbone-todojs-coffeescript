(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    /* TodoItem Model*/

    var App, OurTodos, TodoItem, TodoList, TodoView, TodolooAppView, _ref, _ref1, _ref2, _ref3;
    TodoItem = (function(_super) {
      __extends(TodoItem, _super);

      function TodoItem() {
        _ref = TodoItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      TodoItem.prototype.defaults = {
        content: "empty todo...",
        done: false
      };

      TodoItem.prototype.initialize = function() {
        if (!this.get("content")) {
          return this.set({
            "content": this.defaults.content
          });
        }
      };

      TodoItem.prototype.toggle = function() {
        return this.save({
          done: !this.get("done")
        });
      };

      TodoItem.prototype.clear = function() {
        this.destroy();
        return this.view.remove();
      };

      return TodoItem;

    })(Backbone.Model);
    /* Todo Collection*/

    TodoList = (function(_super) {
      var getDone;

      __extends(TodoList, _super);

      function TodoList() {
        _ref1 = TodoList.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      TodoList.prototype.model = TodoItem;

      TodoList.prototype.localStorage = new Store("todos");

      getDone = function(todo) {
        return todo.get("done");
      };

      TodoList.prototype.done = function() {
        return this.filter(getDone);
      };

      TodoList.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };

      TodoList.prototype.nextOrder = function() {
        if (!this.length) {
          return 1;
        }
        return this.last().get('order') + 1;
      };

      TodoList.prototype.comparator = function(todo) {
        return todo.get("order");
      };

      return TodoList;

    })(Backbone.Collection);
    /* Todo Item View*/

    TodoView = (function(_super) {
      __extends(TodoView, _super);

      function TodoView() {
        this.updateOnEnter = __bind(this.updateOnEnter, this);
        this.close = __bind(this.close, this);
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        _ref2 = TodoView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      TodoView.prototype.tagName = "li";

      TodoView.prototype.template = _.template($("#item-template").html());

      TodoView.prototype.events = {
        "click .check": "toggleDone",
        "dblclick div.todo-content": "edit",
        "click span.todo-destroy": "clear",
        "keypress .todo-input": "updateOnEnter"
      };

      TodoView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        return this.model.view = this;
      };

      TodoView.prototype.render = function() {
        this.$(this.el).html(this.template(this.model.toJSON()));
        this.setContent();
        return this;
      };

      TodoView.prototype.setContent = function() {
        var content;
        content = this.model.get("content");
        this.$(".todo-content").text(content);
        this.input = this.$(".todo-input");
        this.input.bind("blur", this.close);
        return this.input.val(content);
      };

      TodoView.prototype.toggleDone = function() {
        return this.model.toggle();
      };

      TodoView.prototype.edit = function() {
        this.$(this.el).addClass("editing");
        return this.input.focus();
      };

      TodoView.prototype.close = function() {
        this.model.save({
          content: this.input.val()
        });
        return $(this.el).removeClass("editing");
      };

      TodoView.prototype.updateOnEnter = function(e) {
        if (e.keyCode === 13) {
          return this.close();
        }
      };

      TodoView.prototype.remove = function() {
        return $(this.el).remove();
      };

      TodoView.prototype.clear = function() {
        return this.model.clear();
      };

      return TodoView;

    })(Backbone.View);
    /* The Application*/

    TodolooAppView = (function(_super) {
      var el_tag;

      __extends(TodolooAppView, _super);

      function TodolooAppView() {
        this.addAll = __bind(this.addAll, this);
        this.addOne = __bind(this.addOne, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        _ref3 = TodolooAppView.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      el_tag = "#app-wrapper";

      TodolooAppView.prototype.el = $(el_tag);

      TodolooAppView.prototype.statsTemplate = _.template($("#stats-template").html());

      TodolooAppView.prototype.events = {
        "keypress #input-todo": "createOnEnter",
        "keyup #input-todo": "showTooltip",
        "click .todo-clear a": "clearCompleted"
      };

      TodolooAppView.prototype.initialize = function() {
        this.input = this.$("#input-todo");
        OurTodos.bind("add", this.addOne);
        OurTodos.bind("reset", this.addAll);
        OurTodos.bind("all", this.render);
        return OurTodos.fetch();
      };

      TodolooAppView.prototype.render = function() {
        return this.$('#todo-stats').html(this.statsTemplate({
          total: OurTodos.length,
          done: OurTodos.done().length,
          remaining: OurTodos.remaining().length
        }));
      };

      TodolooAppView.prototype.addOne = function(todo) {
        var view;
        view = new TodoView({
          model: todo
        });
        return this.$("#todo-list").append(view.render().el);
      };

      TodolooAppView.prototype.addAll = function() {
        return OurTodos.each(this.addOne);
      };

      TodolooAppView.prototype.newAttributes = function() {
        return {
          content: this.input.val(),
          order: OurTodos.nextOrder(),
          done: false
        };
      };

      TodolooAppView.prototype.createOnEnter = function(e) {
        if (e.keyCode !== 13) {
          return;
        }
        OurTodos.create(this.newAttributes());
        return this.input.val('');
      };

      TodolooAppView.prototype.clearCompleted = function() {
        _.each(OurTodos.done(), function(todo) {
          return todo.clear();
        });
        return false;
      };

      TodolooAppView.prototype.showTooltip = function(e) {
        var show, tooltip, val;
        tooltip = this.$(".ui-tooltip-top");
        val = this.input.val();
        tooltip.fadeOut();
        if (this.tooltipTimeout) {
          clearTimeout(this.tooltipTimeout);
        }
        if (val === '' || val === this.input.attr("placeholder")) {
          return;
        }
        show = function() {
          return tooltip.show().fadeIn();
        };
        return this.tooltipTimeout = _.delay(show, 1000);
      };

      return TodolooAppView;

    })(Backbone.View);
    OurTodos = new TodoList;
    return App = new TodolooAppView();
  });

}).call(this);
