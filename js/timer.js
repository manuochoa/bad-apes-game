StartCountDown("timer", "12/20/2021 00:00");

function StartCountDown(myDiv, myTargetDate) {
    var dthen = new Date(myTargetDate);
    var dnow = new Date();
    ddiff = new Date(dthen - dnow);
    gsecs = Math.floor(ddiff.valueOf() / 1000);
    CountBack(myDiv, gsecs);
}

function Calcage(secs, num1, num2) {
    s = ((Math.floor(secs / num1)) % num2).toString();
    if (s.length < 2) {
        s = "0" + s;
    }
    return (s);
}

function CountBack(myDiv, secs) {
    var timeArr = [],
        holder;
    if (secs > 0) {
        timeArr.days = Calcage(secs, 86400, 100000).split('');
        timeArr.hours = Calcage(secs, 3600, 24).split('');
        timeArr.minutes = Calcage(secs, 60, 60).split('');
        timeArr.seconds = Calcage(secs, 1, 60).split('');

        Object.keys(timeArr).map(function (key) {
            holder = document.getElementById(key);
            for (var i = 0; i < holder.childNodes.length; ++i) {
                switch (holder.childNodes[i].className) {
                    case "left":
                        holder.childNodes[i].innerHTML = timeArr[key][0];
                        break;
                    case "right":
                        holder.childNodes[i].innerHTML = timeArr[key][1];
                        break;
                    default:
                        break;
                }
            }
        });
        setTimeout(function () {
            CountBack(myDiv, secs - 1);
        }, 990);
    } else {
        document.getElementById(myDiv).innerHTML = "Auction Over";
    }
}


document.getElementsByClassName('bg-animation').play();