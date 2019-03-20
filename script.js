function numOfDays(y,m){

  var mom = moment();
  mom.month(m);
  mom.year(y);

  return mom.daysInMonth();

}

function getMonth(m){

  var mom = moment();
  mom.month(m);

  return mom.format("MMMM")
}

function printTitle(anno, mese){

  var tit = $("#mese");

  tit.text(getMonth(mese) + ": 1-" + numOfDays(anno,mese));
}

function printDays(anno,mese){

  var days = numOfDays(anno,mese);
  var list = $("#giorni");
  var mom = moment();
  mom.month(mese);
  mom.year(anno);
  var template = $("#days-template").html();
  var comp = Handlebars.compile(template);

  for (var i = 1; i <= days; i++) {

    mom.date(i);
    var infoDate = {

      USAdate: mom.format("YYYY-MM-DD"),
      date: mom.format("DD MMMM YYYY"),
    }
    var elem = comp(infoDate);
    list.append(elem)
  }
}

function highLight(holy){


  for (var i = 0; i < holy.length; i++) {

    var date = holy[i].date;
    var fest = holy[i].name;
    console.log(fest);

    var  selector = $("li[data-date="+ date + "]");

    selector.addClass("holiday").text(selector.text() + " - " + fest);
  }

}

function printHolydays(anno,mese){

  var outData ={

    year: anno,
    month: mese,
  }

  $.ajax({

    url: "https://flynn.boolean.careers/exercises/api/holidays",
    data: outData,
    method: "GET",
    success: function(inData, state){

      if(inData.success == true && mese >=0 && mese <=11){

        var holidays = inData.response;

        highLight(holidays);
      }
      else{

        var list = $("#giorni");
        list.text(" Errore: raggiunto limite massimo del 2018, tornare indietro");
      }
    },

    error: function(request, state, error){

      console.log(request, state, error);
    },
  });

}

function callPrints(year,month){

  printTitle(year,month);
  printDays (year,month);
  printHolydays(year,month);
}

// se la freccia che ho cliccato mi porta oltre al limite del 2018 ,
//disabilito il click solo per quella freccia

function checkForLimits(num, elem){

  if(num < 0 || num > 11){

    elem.css("pointer-events","none")
  }
}

function choseMonth(y,m){

  var arrows = $(".arrows a > .fas");
  var list = $("#giorni");

  arrows.click(function(){

    list.empty();

    // riabilito al click tutte le frecce
    arrows.css("pointer-events","auto");

    if($(this).is(".fa-arrow-left")) {

      m--;
      callPrints(y,m)
    }
    else if($(this).is(".fa-arrow-right") ){

      m ++;
      callPrints(y,m)
    }

    checkForLimits(m, $(this) );
  })
}


function init(){

  var year = 2018;

  // 0: starts from genuary:

  callPrints(year,0);
  choseMonth(year,0);
}

$(document).ready(init)
