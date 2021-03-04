
////CODE book.html ////

async function flightDestination() {
    try {
        const resp = await fetch(`http://localhost:5500/airport`, {
            method: 'Get'
        });
        const respData = await resp.json();
        return respData;
    }
    catch (err) {
        console.log(err.message);
        throw err
    }
}

async function flightsDates() {
    try {
        const resp = await fetch(`http://localhost:5500/dates`, {
            method: 'GET'
        });
        const respData = await resp.json();
        return respData
    }
    catch (err) {
        console.log(err)
        throw err
    }
}

async function htmlFlightDestination() {
    try {
        const resDataDestination = await flightDestination();
        const respDataDates = await flightsDates();
        var HTMLFrom = ""
        var HTMLTo = ""
        var HTMLdate = ""
        var size = resDataDestination.length;
    
        for (i = 0; i < size; i++) {
            HTMLFrom += `<option value=${resDataDestination[i]["airport_code"]}> 
            ${resDataDestination[i]["city"]} </option>`;
        }

        var j = size;
        while (j != 0) {
            HTMLTo += `<option value=${resDataDestination[j - 1]["airport_code"]}> 
            ${resDataDestination[j - 1]["city"]} </option>`;
            j -= 1;
        }
        for (i = 0; i < respDataDates.length; i++) {

            var d = respDataDates[i]["scheduled_departure"]
            var date = (new Date(d)).toLocaleDateString()
            var [mm, dd, yyyy] = date.split("/")
            if (dd.length == 1 ) {
                dd = "0" + dd
            }
            else if(mm.length==1){
                mm="0"+mm
            }
            var revdate = `${yyyy}-${mm}-${dd}`
            HTMLdate += `<option value=${revdate}>${revdate}</option>`
        }

        var from = document.querySelector('#From');
        var to = document.querySelector('#To');
        var optionDates = document.querySelector('#Date')
        from.innerHTML = HTMLFrom;
        to.innerHTML = HTMLTo;
        optionDates.innerHTML = HTMLdate;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
function select_flight() { //On click save data
    //Before flight.html loads retireve the inputs and get values upon the submission
    try {
        var from = document.getElementById('From');
        var to = document.getElementById('To');
        var travelers = document.getElementById('Travelers');
        var date = document.getElementById('Date');
        var id = from.options[from.selectedIndex].value;
        var id2 = to.options[to.selectedIndex].value;
        var number_traverlers = travelers.options[travelers.selectedIndex].value;
        var date_choose = date.options[date.selectedIndex].value;
        sessionStorage.setItem("id", id);
        sessionStorage.setItem("id2", id2);
        sessionStorage.setItem("date_choose", date_choose);
        sessionStorage.setItem("num_traverles", number_traverlers);
        load_flightpage();
    }
    catch (err) {
        console.log(err.message);
    }
}

function load_flightpage() {
    location.href = 'flight.html';
}


///CODE: flights.html/////

async function flightInfo() {
    try {
        var id = sessionStorage.getItem("id")
        var id2 = sessionStorage.getItem("id2")
        var date_choose = sessionStorage.getItem("date_choose")
        const resp = await fetch(`http://localhost:5500/flightstart/${id}/flightend/${id2}/date/${date_choose}`, {
            method: "GET"
        });
        const respData = await resp.json();
        return respData;
    }
    catch (err) {
        console.log(err.message)
        throw err

    }
    //setFlights(respdata);
    //sessionStorage.setItem("key", JSON.stringify(respdata));
}

async function flightRoundTrip(id) {
    try {
        const resp = await fetch(`http://localhost:5500/roundtrip/${id}`);
        const respData = await resp.json();
        return respData;
    }
    catch (err) {
        console.log(err)
    }
}

async function indirectTrip(id) {
    try {
        const resp = await fetch(`http://localhost:5500/indirect/${id}`);
        const respData = await resp.json();
        return respData;
    }
    catch (err) {
        console.log(err)
    }
}
async function displayTable() {
    const fligthTable = document.querySelector('#input-table');
    const roundTable = document.querySelector('#roundtrip_input')
    var tableHTML = "";
    var secondTableHtml = "";
    var flightData = await flightInfo()
    
    //data retrieve from select_flight
    for (i = 0; i < flightData.length; i++) {
        var departure_date = flightData[i]["scheduled_departure"]
        var date = new Date(departure_date)
        var arrival_date = flightData[i]["scheduled_arrival"]
        var date2 = new Date(arrival_date)
        if (flightData[i]["stops"] == "roundtrips") {
            var round_trip = await flightRoundTrip(flightData[i]["flight_id"]);
            var sa = round_trip[0]["scheduled_arrival"]
            var sd = round_trip[0]["scheduled_departure"]
            var date3 = new Date(sa)
            var date4 = new Date(sd)
            secondTableHtml += `<tr> 
            <th>${flightData[i]["flight_id"]} </th>
            <th>${flightData[i]["departure_airport"]} </br> ${date.toLocaleDateString() + " " + date.toLocaleTimeString()} </th>
            <th>${flightData[i]["arrival_airport"]} </br>${date2.toLocaleDateString() + " " + date2.toLocaleTimeString()} </th>
            <th>${flightData[i]["arrival_airport"]} </br>${date4.toLocaleDateString() + " " + date4.toLocaleTimeString()} </th>
            <th>${flightData[i]["departure_airport"]} </br>${date3.toLocaleDateString() + " " + date3.toLocaleTimeString()} </th>
            <th>${flightData[i]["seats_available"]}</th>
            <th>${flightData[i]["meal"]}</th>
            <th>${flightData[i]["movie"]}</th>
            <th>${flightData[i]["amount"]}</th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${flightData[i]["flight_id"]} value=${flightData[i]["amount"]} onclick=loadPaymentPage(this.id,this.value)>BOOK</button></th>
            </tr>`
        }
        else if (flightData[i]['stops'] == "nonstops") {
            tableHTML += `<tr>
            <th> ${flightData[i]["flight_id"]}</th>
            <th>${flightData[i]["departure_airport"]}<br/>${date.toLocaleDateString() + " " + date.toLocaleTimeString()}</th>
            <th>${flightData[i]["arrival_airport"]}<br/>${date2.toLocaleDateString() + " " + date2.toLocaleTimeString()}</th>
            <th>${flightData[i]["seats_available"]}</th>
            <th>${flightData[i]["meal"]}</th>
            <th>${flightData[i]["movie"]}</th>
            <th>${flightData[i]["stops"]}
            <th>${flightData[i]["amount"]}</th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${flightData[i]["flight_id"]} value=${flightData[i]["amount"]} onclick=loadPaymentPage(this.id,this.value)>BOOK</button></th>
            </tr>`
        }
        else {
            
            var indirectT = await indirectTrip(flightData[i]["flight_id"]);
            
            tableHTML += `<tr>
            <th>${flightData[i]["flight_id"]}</th>
            <th>${flightData[i]["departure_airport"]}</br>${date.toLocaleDateString() + " " + date.toLocaleTimeString()}</th>
            <th>${flightData[i]["arrival_airport"]}</br> ${date2.toLocaleDateString() + " " + date2.toLocaleTimeString()}</th>
            <th>${flightData[i]["seats_available"]}</th>
            <th>${flightData[i]["meal"]}</th>
            <th>${flightData[i]["movie"]}</th>
            <th>${flightData[i]["departure_airport"]}`
            
            for (j = 0; j < indirectT.length; j++) {
                tableHTML += `${"->" + indirectT[j]["departure_airport"]}`
            }
            
            tableHTML += `${"->" + flightData[i]["arrival_airport"]}</th>
            <th>${flightData[i]["amount"]}</th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${flightData[i]["flight_id"]} value=${flightData[i]["amount"]} onclick=loadPaymentPage(this.id,this.value)>BOOK</button></th>
            </tr>`
        }

    }
    roundTable.innerHTML = secondTableHtml;
    fligthTable.innerHTML = tableHTML;

}
function loadPaymentPage(id, cost) {
    sessionStorage.setItem("keyid", id);//data save from display_function()
    sessionStorage.setItem("keycost", cost);
    location.href = 'payment.html';
}

///CODE payment.html /////

const formPeople = () => {//inputs and cost payment.html
    var num_people = sessionStorage.getItem("num_traverles");
    var cost = sessionStorage.getItem("keycost");
    var infoINPUT = document.querySelector("#inputs");
    formHTML = ""
    for (i = 0; i < num_people; i++) {
        formHTML += `<h2 class = "bg-info ">Travelers ${i + 1}*</h2>
        <div class="input-group ">
        <input id="Firstname${i + 1}" type="text" placeholder= "Firstname" class="form-control" name="fname" >
        <input id="Lastname${i + 1}" type="text" placeholder= "Lastname" class="form-control "  name="lname" >
        </div>`
    }
    document.getElementById("fares").innerHTML = "Fares: $" + (cost * num_people);
    var tax = document.getElementById("taxes").innerHTML.substr(17);
    var total = ((cost * num_people) + Number(tax));
    document.getElementById("total").innerHTML = "Total: $" + (total);
    infoINPUT.innerHTML = formHTML;
}
async function formDiscount() {
    var total = document.getElementById("total").innerHTML.substr(8);
    var codeEnter = document.querySelector("#validation").value;

    if (codeEnter.length !=0) {
        var discountData = await discountInfo(codeEnter);
        
        if (discountData.length!=0 && codeEnter == discountData[0]["discount_code"] ) {
            console.log(discountData[0]["minimum"])
            var discountPercentage = discountData[0]["amount"]
            var newDiscount = total * discountPercentage;
            document.getElementById("discount").innerHTML = "Discount: $" + (newDiscount);
            document.getElementById("total").innerHTML = "Total: $" + (total - newDiscount);
            document.getElementById("validationbutton").disabled = true;
            
        }
        else {
            window.alert("Don't Qualify on Discount or Not a valid code")
            document.getElementById("validation").value=""
            
        }
    }
}

async function discountInfo(id) {
    try {
        try {
            const resp = await fetch(`http://localhost:5500/discount/${id}`);
            const respData = await resp.json();
            return respData;
        }
        catch (err) {
            console.log(err)
        }
    }
    catch (err) {
        console.log(err)
    }
}

function disableButton() {//button check input if all fill in
    var num_people = sessionStorage.getItem("num_traverles");
    var count = 0;
    for (i = 0; i < Number(num_people); i++) {
        count += 1;
    }

    var card = document.querySelector("#card").value.length;
    var email = document.querySelector("#email").value.length;
    var phone = document.querySelector("#number").value.length;
    //before submiting need  check if inputs are filled in before executing insertInfo;
    //
    if (card == 0 || email == 0 || phone == 0 || num_people != count) {
        window.alert("Please Fill Out All Require Information")
    }
    else if (!checkemail(document.querySelector("#email").value)){
        window.alert("please enter valid email for example: qwe@gmail.com");
    }
    else {
        insertInfo();
    }

}
function checkemail(email){
    return ((/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)$/.test(email)));
}

async function insertInfo() {// execute bfore history.html loads
    try {
        var num_people = sessionStorage.getItem("num_traverles");
        var total = document.getElementById("total").innerHTML.substr(8);
        var flight_id = sessionStorage.getItem("keyid");
        const email = document.querySelector("#email").value;
        const phone = document.querySelector("#number").value;
        var credit=document.querySelector("#card").value;
        var codeEnter = document.querySelector("#validation").value;
        var discountData = await discountInfo(codeEnter);// in case input discount code has something invalid and not clear
        
        if(codeEnter==null || codeEnter=="" || discountData.length==0){
            codeEnter='NONEQA'
        }

        var container = []
        for (i = 0; i < num_people; i++) {
            var temp = []
            const first_name = document.querySelector("#Firstname" + (i + 1)).value;
            const last_name = document.querySelector("#Lastname" + (i + 1)).value;
            const body = {
                flight_id: flight_id,
                passenger_first_name: first_name,
                passenger_last_name: last_name,
                email: email,
                phone: phone,
                total_amount: total,
                code:codeEnter,
                credit_card:credit
            };
            
            
            //TRANSACTION
            
            const data = await fetch("http://localhost:5500/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const respdata = await data.json();
            var f_id = respdata.rows[0]["flight_id"];
            var t_no = respdata.rows[0]["ticket_no"];

            temp.push(t_no);
            temp.push(f_id);
            container.push(temp);
            console.log("HELLO")
            //flight time departure and arrival time   
        }
        sessionStorage.setItem("keyInsert", container);
        loadHistoryPage();
    }
    catch (err) {
        console.log(err.message);
    }
}
function loadHistoryPage() {
    location.href = 'history.html';
}



///CODE history.html////

async function displayHistory() {//payment.html to history.html
    //upon history.html loading display history
    const fligthTable = document.querySelector('#history');
    var data = sessionStorage.getItem("keyInsert").split(",")
    HTML = "";
    for (i = 0; i < data.length; i++) {
        if (i % 2 == 0) {
            HTML += `<tr>`
            HTML += `<th>${data[i]}</th>`
        }
        else if (i % 2 == 1) {
            HTML += `<th>${data[i]}</th>`
            HTML += `<th>TBH</th>`

            var data2 = await flight_boarding(data[i], data[i - 1])
            var gate = data2[0]["gate"]
            var scheduled_arrival = data2[0]["scheduled_arrival"]
            var scheduled_departure = data2[0]["scheduled_departure"]
            var date1=new Date(scheduled_arrival)
            var date2=new Date(scheduled_departure)
            HTML += `<th>${gate}</th>`
            HTML += `<th>${date2.toLocaleDateString()+" "+date2.toLocaleTimeString()}</th>`
            HTML += `<th>${date1.toLocaleDateString()+" "+date1.toLocaleTimeString()}</th>`

            HTML += `</tr>`
        }
    }
    fligthTable.innerHTML = HTML;

    //var data2=await flight_boarding

}

async function flight_boarding(id, id2) { //payment to history
    try {
        const response = await fetch(`http://localhost:5500/flight/${id}/board_pas/${id2}`, {
            method: "GET"
        });
        const respdata = await response.json();
        return respdata
        //store data
    }
    catch (err) {
        console.log(err.message);
    }

}


///CODE trips.html/////

async function purchase(id){
    try{
        const response = await fetch(`http://localhost:5500/history/${id}`, {
            method: "GET"
        });
        const respdata = await response.json();
        return respdata

    }
    catch(err){
        console.log(err.message)
    }
}
function loadOtherHistory() {
    var email = document.querySelector("#check_email").value;
    console.log(email)
    var emailFormat=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (emailFormat.test(email)) {
        sessionStorage.setItem("email", email);
        location.href = 'historyV2.html'
    }
    else 
    {
        window.alert("PLEASE FILL OUT REQUIRE INFORMATION AND ENTER VALID EMAIL");
    }
}


async function displayHistoryV2() {
    const fligthTable = document.querySelector('#historyV2');
    const email = sessionStorage.getItem("email")
    var data = await purchase(email);
    var HTML=""
    //console.log(data)
    for (i=0;i<data.length;i++){
        var departure_date=new Date(data[i]["scheduled_departure"])
        var arrival_date=new Date(data[i]["scheduled_arrival"])
        HTML+=`<tr>
        <th>${data[i]["ticket_no"]}</th>
        <th>${data[i]["flight_id"]}</th>
        <th>${data[i]["seat_no"]}</th>`
        var roundT= await flightRoundTrip(data[i]["flight_id"]);
        var indirectT= await indirectTrip(data[i]["flight_id"]);
        if(roundT.length!=0){
            
            var indirectArrival=new Date (roundT[0]["scheduled_arrival"]);
            var indirectDepartutre=new Date (roundT[0]["scheduled_departure"]);
            HTML += `<th>Round Trip</br>
            1st Trip: ${data[i]["departure_airport"]}</br>${departure_date.toLocaleDateString() +" "+ departure_date.toLocaleTimeString()}</br>
            2nd Trip: ${data[i]["arrival_airport"]}</br>${indirectDepartutre.toLocaleDateString() + " " +indirectDepartutre.toLocaleTimeString()}</th>
            <th>Round Trip</br>
            1st Trip: ${data[i]["arrival_airport"]}</br> ${arrival_date.toLocaleDateString()+" "+arrival_date.toLocaleTimeString()}  </br>
            2nd Trip: ${data[i]["departure_airport"]}</br> ${indirectArrival.toLocaleDateString() + " "+ indirectArrival.toLocaleTimeString()} </th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${data[i]["ticket_no"]} value=${data[i]["flight_id"]} onclick=refundPurchase(this.id,this.value)>Refund</button></th>`


        }
        else if(indirectT.length!=0){
            
            HTML+=`<th>${data[i]["departure_airport"]}</br>${departure_date.toLocaleDateString() +" "+ departure_date.toLocaleTimeString()}</br></br>Indirect Stop: ${indirectT[0]["departure_airport"]} </th>
            <th>${data[i]["arrival_airport"]}</br>${arrival_date.toLocaleDateString()+" "+arrival_date.toLocaleTimeString()}</th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${data[i]["ticket_no"]} value=${data[i]["flight_id"]} onclick=refundPurchase(this.id,this.value)>Refund</button></th>`
            
        }
        else{
            
            HTML+=`<th>${data[i]["departure_airport"]}</br>${departure_date.toLocaleDateString() +" "+ departure_date.toLocaleTimeString()}</th>
            <th>${data[i]["arrival_airport"]}</br>${arrival_date.toLocaleDateString()+" "+arrival_date.toLocaleTimeString()}</th>
            <th> <button class= "btn btn-primary text-center" type="button" id=${data[i]["ticket_no"]} value=${data[i]["flight_id"]} onclick=refundPurchase(this.id,this.value)>Refund</button></th>`
            
        }
        HTML+=`</tr>`
       
    }
    fligthTable.innerHTML=HTML;
    //trips.html to history.html
}


async function refundPurchase(id,id2) {
    try {
        const see =await seeHaveSeat(id);
        if(see.length==0){
            window.alert("Not Eligible for refund")
        }
        else{

            const response = await fetch(`http://localhost:5500/refund/${id}/refund2/${id2}`, {
            method: "DELETE"
            });
            window.alert("refund successful");
        }
        
    }
    catch (err) {
        console.log(err);
    }

}


////Code: Checkin.html ////

async function checkIN(){
    var first_name=document.querySelector("#first").value
    var last_name=document.querySelector("#last").value
    var num=document.querySelector("#num").value
    try{
        if(first_name.length==0 || last_name.length==0 || num.length==0){
            window.alert("Please Fill Out Require Info")
        }
        else{
            const verify= await tryReserveSeat(num,first_name,last_name)
            if(verify.length==0){
                window.alert("Such Name or Ticket Num Does not exist")
            }
            else{
                const see= await seeHaveSeat(num);
                if(see.length==0){
                    window.alert("Passenger Already has a seat")
                }
                else{
                    const seat=await lookingSeat(num);
                    window.alert("Your seat number is: " +seat)
                }
                
            }
        }
    }
    catch(err){
        console.log(err.message)
    }
}

async function tryReserveSeat(id,id2,id3){//1
    try{
        const response=await fetch(`http://localhost:5500/seat/${id}/first_name/${id2}/last_name/${id3}`,{
            method: "GET"
        });
        const respData= await response.json()
        return respData
    }
    catch(err){
        console.log(err.message);
    }
}

async function seeHaveSeat(id){//2
    try{
        const response= await fetch(`http://localhost:5500/checkSeat/${id}`,{
            method:"GET"
        });
        const respData=await response.json()
        return respData;
    }
    catch(err){
        console.log(err.message);
    }
}

async function lookingSeat(id){//3
    try{
        const response=await fetch(`http://localhost:5500/reserve/${id}`,{
            method: "PUT"
        });
        const respData= await response.json()
        return respData
    }
    catch(err){
        console.log(err.message);
    }
}

