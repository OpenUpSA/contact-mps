console.log("secretballot");

var daysRemaining=(function(){ 
    var oneDay = 24*60*60*1000;
    var firstDate = new Date();
    var secondDate = new Date(2017, 6, 25, 23, 59);
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
})();

console.log(daysRemaining);