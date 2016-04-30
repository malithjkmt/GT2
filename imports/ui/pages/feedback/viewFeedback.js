import './viewFeedback.html';




Template.viewFeedback.helpers({
    messageThreads() {

        var myArray = Feedbacks.find({}, {sort: {timeStamp: -1}}).fetch();
        var distinctArray = _.uniq(myArray, false, function(d) {return d.user});
       // var disctinctValues = _.pluck(distinctArray, 'user');
        console.log(distinctArray);
        return distinctArray;


    },
    formatDate: function(date){
        return moment(date).format('MM-DD-YYYY');
    }

});
