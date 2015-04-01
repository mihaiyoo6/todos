Tasks = new Mongo.Collection('tasks');
if (Meteor.isClient) {

    Meteor.subscribe("tasks");

    Template.body.helpers({
        tasks: function() {
            return Tasks.find({}, {
                sort: {
                    createdAt: -1
                }
            });
        }
    })

    Template.body.events({
        "submit .new-task": function(event) {
            console.log(event);
            var text = event.target.text.value;
            Tasks.insert({
                text: text,
                createdAt: new Date()
            });
            event.target.text.value = '';
            return false;
        },
        "click [data-action=newTask]": function(event) {
            //console.log(event.target);
            var inputVal = document.querySelectorAll('paper-input')[0].value;
            if (inputVal.length > 0) {
                Tasks.insert({
                    text: inputVal,
                    createdAt: new Date(),
                    checked: false
                });
                document.querySelectorAll('paper-input')[0].value = "";
                document.querySelectorAll('.input-container')[0].style.display = 'none';
            } else {

            }
        },
        "click [data-action=fab]": function() {
            var container = document.querySelectorAll(".input-container")[0];
            container.style.display = "block";
        }
    });

    Template.task.helpers({
        isChecked: function() {
            return this.checked ? 'checked' : 'unchecked';
        }
    });

    Template.task.events({
        'click [data-action=deleteTask]': function() {
            Meteor.call('deleteTask', this._id);
        },
        //  "click .toggle-checked": function() {
        //     // Set the checked property to the opposite of its current value
        //     Meteor.call("setChecked", this._id, !this.checked);
        //     // Tasks.update(this._id, {
        //     //     $set: {
        //     //         checked: !this.checked
        //     //     }
        //     // });
        // },
        "change .toggle-checked": function(e) {
            var checked = e.currentTarget.checked;
            console.log(checked);
            if (checked !== this.checked) {
                Meteor.call("setChecked", this._id, checked);
            }
        }
    });
}

Meteor.methods({
    addTask: function(text) {
        // Make sure the user is logged in before inserting a task
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    },
    deleteTask: function(taskId) {
        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }
        Tasks.remove(taskId);
    },
    setChecked: function(taskId, setChecked) {

        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }


        Tasks.update(taskId, {
            $set: {
                checked: setChecked
            }
        });
    },
    setPrivate: function(taskId, setToPrivate) {
        var task = Tasks.findOne(taskId);

        // Make sure only the task owner can make a task private
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.update(taskId, {
            $set: {
                private: setToPrivate
            }
        });
    }
});


if (Meteor.isServer) {
    Meteor.publish("tasks", function() {
        return Tasks.find();
    });
}