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

  tit.text(getMonth(mese));
}


// se il giorno "d" in esame è una holiday allora mi ritorno la festa altrimenti ritorno ""
// l'if di Handlebars js decide se mi apparirà  o no il div festa

function isHoliday(d,holy){

  for (var i = 0; i < holy.length; i++) {

      var date = holy[i].date;
      var fest = holy[i].name;

      if(d  == date)  return fest;

  }
  return "";
}

function printDays(anno,mese,holy){

  var days = numOfDays(anno,mese);
  var giorni = $("#giorni .day");

  var mom = moment();
  mom.month(mese);
  mom.year(anno);

  var template = $("#days-template").html();
  var comp = Handlebars.compile(template);

  //Clono il mom e ricavo il weekday del primo giorno del mese (date(1))
  var offSet = moment(mom).date(1).isoWeekday() - 1;

  for (var i = 0; i < days; i++) {

    mom.date(i+1);

    var infoDate = {

      date: mom.format("D ddd") ,
      festa: isHoliday(mom.format("YYYY-MM-DD"),holy),
    }

    var elem = comp(infoDate);
    giorni.eq(i + offSet).append(elem);

    if(infoDate.festa != "") giorni.eq(i + offSet).addClass("holiday");
  }

  if( mese != 0 ){

    fillDaysBegin(anno,mese,offSet,comp);
  }

  if(mese != 11){
    fillDaysEnd(anno,mese,offSet,days,comp);
  }
}


//Funzioni per completare i days vuoti con i giorni del mese precedente e sucessivo

function fillDaysBegin(y,month,num,comp){

  var m = month - 1;

  var mom = moment();
  mom.year(y).month(m);
  var days = numOfDays(y,m)
  var range = days-num+1

  var giorni = $("#giorni .day");

  for (var i = 0; i < num; i++) {

    mom.date(range+i);

    var infoDate = { date: mom.format("D ddd"), }

    var elem = comp(infoDate);
    giorni.eq(i).append(elem).addClass("otherMonth");
  }
}

function fillDaysEnd(y,month,num,days,comp){

  var m = month + 1;
  var mom = moment();
  mom.year(y).month(m);
  var giorni = $("#giorni .day");
  var start = (days + num);
  var j = 1;
  for (var i = start; i < giorni.length ; i++) {

    mom.date(j);
    j++;

    var infoDate = { date: mom.format("D ddd"), }

    var elem = comp(infoDate);
    giorni.eq(i).append(elem).addClass("otherMonth");
  }
}

// Logica : chiamo prima la getHolyday , se è un success allora chiamo la printDays alla quale passo
// l'oggetto holidays. sarà poi printDays a determinare  per ogni giorno creato se è una holiday o no

function getHolydays(anno,mese){

  var outData = {

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
        printDays(anno,mese, holidays);

      }
      else{

        printDays(anno,mese, 0)
      }
    },

    error: function(request, state, error){

      console.log(request, state, error);
    },
  });

}

// prende offSet + i giorni del mese  e li divide per 7 e arrotondo per eccesso
// il risultato è il numero di row (settimane) che mi servono per far stare tutti i valori
// Creo solo le righe necessarie a farci stare tutto

function printRows(anno, mese){

  var days = numOfDays(anno,mese);
  var mom = moment().year(anno).month(mese).date(1);
  var offSet = mom.isoWeekday() -1
  var spazi = offSet + days;
  var rowsNum = Math.ceil(spazi / 7 )

  var comp = Handlebars.compile($("#row-template").html());
  var row = comp();
  for (var i = 0; i < rowsNum; i++) {
    $("#giorni").append(row);
  }

}

// Update del valore attivo de menu a tendina
function updateActiveItem(it, act){

  it.removeClass("active");
  act.addClass("active");
}

// funzione che mi naviga da un mese all'altro  sia attraverso le freccie sia attraverso il menu a tendina

function choseMonth(y,m){

  var arrows = $(".arrows a > .fas");
  var list = $("#giorni");
  var item = $("#month-menu > .menu > .item");

  //CLICK SU FRECCE

  arrows.click(function(){

    list.empty();

    // riabilito al click tutte le frecce
    arrows.show();

    if($(this).is(".fa-arrow-left")) {

      m--;
      callPrints(y,m)
    }
    else if($(this).is(".fa-arrow-right") ){

      m ++;
      callPrints(y,m)
    }

    // se la freccia che ho cliccato mi porta al limite del 2018 la nascondo
    if(m == 0 || m == 11){  $(this).hide(); }

    updateActiveItem(item, item.eq(m));

  })

  //CLICK SU MENU ITEMS

  item.click(function(){

    list.empty();
    arrows.show()
    m =  $(this).index();

    callPrints(y , m);
    updateActiveItem(item, $(this));

    if (m == 0) $(".fa-arrow-left").hide();
    else if (m == 11) $(".fa-arrow-right").hide();

  })
}

// Comparsa/scomparsa menu a tendina

function clickMenu(){

  var monthMenu = $("#month-menu");

  monthMenu.click(function(event){

    $(this).children(".menu").slideToggle(300);
    event.stopPropagation()
  })

  $(window).click(function() {

    $("#month-menu").children(".menu").slideUp(300);
  });
}

// chiama le funzioni che creano righe, titolo e giorni.
function callPrints(year,month){

  printRows(year,month);
  printTitle(year,month);
  getHolydays(year,month);
}

function init(){

  var year = 2018;

  // 0: starts from january:

  callPrints(year,0);
  choseMonth(year,0);
  clickMenu();
}

$(document).ready(init)
