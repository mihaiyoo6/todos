Tasks = new Mongo.Collection('tasks');
if (Meteor.isClient) {

    Meteor.subscribe("tasks");

    Template.body.helpers({
        tasks: function() {
            if (Session.get('completed-tasks')) {
                return Tasks.find({
                    checked: true,
                    owner: Meteor.userId()
                }, {
                    sort: {
                        createdAt: -1
                    }
                });
            } else if (Session.get('private-tasks')) {
                return Tasks.find({
                    private: true
                }, {
                    sort: {
                        createdAt: -1
                    }
                });
            } else if (Session.get('my-tasks')) {
                return Tasks.find({
                    checked: false,
                    owner: Meteor.userId()
                }, {
                    sort: {
                        createdAt: -1
                    }
                });
            } else {

                return Tasks.find({
                    private: false,
                }, {
                    sort: {
                        createdAt: -1
                    }
                });
            }
        }
    })

    Template.body.events({
        "submit .new-task": function(event) {
            var text = event.target.text.value;
            Tasks.insert({
                text: text,
                createdAt: new Date()
            });
            event.target.text.value = '';
            return false;
        },
        "click [data-action=newTask]": function(event) {
            var inputVal = document.querySelectorAll('paper-input')[0].value;
            if (inputVal.length > 0) {

                Meteor.call("addTask", inputVal);
                document.querySelectorAll('paper-input')[0].value = "";
                document.querySelectorAll('.input-container')[0].style.display = 'none';
            } else {

            }
        },
        "click [data-action=showToast]": function() {
            console.log('showToast');
            document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
            document.querySelectorAll('paper-toast')[0].show();
        },
        "click [data-action=fab]": function() {
            if (!Meteor.userId()) {
                document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                var container = document.querySelectorAll(".input-container")[0];
                container.style.display = "block";

            }
        },
        "login": function() {

            document.getElementById('loginDialog').toggle();
        },
        "click [data-action=all-tasks]": function() {
            if (!Meteor.userId()) {
                document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                console.log("all-tasks");
                Session.set('my-tasks', false);
                Session.set('completed-tasks', false);
                Session.set('private-tasks', false);
            }
        },
        "click [data-action=private-tasks]": function() {
            if (!Meteor.userId()) {
                document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                console.log("private-tasks");
                Session.set('completed-tasks', false);
                Session.set('my-tasks', false);
                Session.set('private-tasks', true);
            }
        },
        "click [data-action=completed-tasks]": function() {
            if (!Meteor.userId()) {
                document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                console.log("completed-tasks");
                Session.set('private-tasks', false);
                Session.set('my-tasks', false);
                Session.set('completed-tasks', true);
            }
        },
        "click [data-action=my-tasks]": function() {
            if (!Meteor.userId()) {
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                console.log("my-tasks");
                Session.set('private-tasks', false);
                Session.set('completed-tasks', false);
                Session.set('my-tasks', true);
            }
        }
    });

    Template.task.helpers({
        isChecked: function() {
            return this.checked ? 'checked' : 'unchecked';
        },
        isOwner: function() {
            return this.owner === Meteor.userId();
        },
        isPrivate: function() {
            return this.private ? 'checked' : 'unchecked';
        },
        isPrivateText: function() {
            return this.private ? 'Private' : 'Public';
        },
        islogin: function() {
            if (!Meteor.userId()) {
                return 'disabled';
            }
        }
    });

    Template.task.events({
        'click [data-action=deleteTask]': function() {
            Meteor.call('deleteTask', this._id);
        },
        "change .toggle-checked": function(e) {
            if (!Meteor.userId()) {
                e.preventDefault();
                document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have to login.");
                document.querySelectorAll('paper-toast')[0].show();
            } else {
                var checked = e.currentTarget.checked;
                if (checked !== this.checked) {
                    Meteor.call("setChecked", this._id, checked);
                }
            }
        },
        "change paper-toggle-button": function() {
            Meteor.call("setPrivate", this._id, !this.private);
        }
    });

    Template.loginDialog.events({
        'click [data-action=login]': function(event, template) {
            event.preventDefault();
            var emailVar = template.find('#login-email').value;
            var passwordVar = template.find('#login-password').value;
            Meteor.loginWithPassword(emailVar, passwordVar, function(err) {
                if (err) {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', err.reason);
                    template.find('#login-email').value = '';
                    template.find('#login-password').value = '';
                } else {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have sucessfully logged in.");
                }
                document.querySelectorAll('paper-toast')[0].show();

            });
        }
    });

    Template.registerDialog.events({
        'click [data-action=register]': function(event, template) {
            event.preventDefault();
            var emailVar = template.find('#register-email').value;
            var passwordVar = template.find('#register-password').value;
            Accounts.createUser({
                username: emailVar,
                password: passwordVar
            },function(err){
                if (err) {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', err.reason);
                    template.find('#register-email').value = '';
                    template.find('#register-password').value = '';
                } else {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have sucessfully created new user.");
                }
                document.querySelectorAll('paper-toast')[0].show();
            });
        }
    })


    Template.loginMenu.events({
        "click #login-item": function() {
            document.getElementById('loginDialog').toggle();
        },
        "click #register-item": function() {
            document.getElementById('registerDialog').toggle();
        },
        "click #logout-item": function() {
            Meteor.logout(function(err) {
                if (err) {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', err.reason);
                } else {
                    document.querySelectorAll('paper-toast')[0].setAttribute('text', "You have sucessfully logged out.");
                }
                document.querySelectorAll('paper-toast')[0].show();
            });
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
            private: false,
            checked: false,
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
        return Tasks.find({
            $or: [{
                private: {
                    $ne: true
                }
            }, {
                owner: this.userId
            }]
        });
    });
}