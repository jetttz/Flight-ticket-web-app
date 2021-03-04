const express =require('express');//line 1 to 3 basic requirements/header needed
const app =express()
const cors=require('cors');
const pool=require('./db');//location log in info
var fs=require('fs');


app.use(cors());
app.use(express.json());
/// Code for: book.html////
/// TABLE: airport ///
pool.query("SET SCHEMA 'LZHK6O';");
fs.appendFile('query.sql',"SET SCHEMA 'LZHK6O';\n", (err)=>{
            if(err) throw err;
        });
app.get('/airport',async(req,res)=>{
    try{
        const respData=await pool.query(`SELECT * FROM LZHK6O.airport`);
        res.json(respData.rows)
        fs.appendFile('query.sql',"SELECT * FROM LZHK6O.airport;\n", (err)=>{
            if(err) throw err;
        });
    }
    catch(err){
        console.log(err)
    }
})


app.get('/dates',async(req,res)=>{
    try{
        const respData=await pool.query(`SELECT DISTINCT scheduled_departure::date FROM LZHK6O.flights ORDER BY (scheduled_departure::date)`);
        res.json(respData.rows);
        fs.appendFile('query.sql',"SELECT DISTINCT scheduled_departure::date FROM LZHK6O.flights ORDER BY (scheduled_departure::date) ;\n", (err)=>{
            if(err) throw err;
        });
       
    }
    catch(err){
        console.log(err)
    }
})

//// CODE for: airlane.html(home page)////
/// TABLE: discount ///
app.get('/discount', async(req,res)=>{
    try{
        const respData= await pool.query(`SELECT * FROM LZHK6O.discount`);
        res.json(respData.rows);
        fs.appendFile('query.sql',"SELECT * FROM LZHK6O.discount;\n", (err)=>{
            if(err) throw err;
        });
    }
    catch(err){
        console.log(err)
    }
}) 
app.get('/discount/:id',async(req,res)=>{
    try{
        const {id}=req.params;
        const respData= await pool.query(`SELECT * FROM LZHK6O.discount where discount_code=$1`,[id]);
        fs.appendFile('query.sql',`SELECT * FROM LZHK6O.discount WHERE discount_code=${id};\n`, (err)=>{
            if(err) throw err;
        });
        res.json(respData.rows);
        
    }
    catch(err){
        console.log(err)
    }
})

//// CODE for: payment.html Transaction ////
/// Table: booking, ticket, ticket_flights, payment, ///
app.post('/data',async(req,res)=>{
    const client = await pool.connect()
    try{
        const {total_amount}=req.body, {passenger_first_name}=req.body,{passenger_last_name}=req.body;
        const {email}=req.body,{phone}=req.body,{flight_id}=req.body, {credit_card}=req.body, {code}=req.body;
        //console.log("BEGIN TRANSACTION");

        await client.query('BEGIN');

        //console.log("TRY TO INSERT booking");
        const sql_bookings=`INSERT INTO LZHK6O.bookings (total_amount,book_date) VALUES($1,current_timestamp) RETURNING *`;
        
        const data_1 =await client.query(sql_bookings,[total_amount]); 
        const book_ref_data= data_1.rows[0].book_ref; 

        //console.log("TRY TO INSERT ticket");
    
        const sql_ticket=`INSERT INTO LZHK6O.ticket (book_ref,passenger_first_name,passenger_last_name,email,phone) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
        
        const ticket_data=[book_ref_data,passenger_first_name,passenger_last_name,email,phone];
        const data_2 = await client.query(sql_ticket,ticket_data);
        const ticket_num_data=data_2.rows[0].ticket_no;
        
        //console.log("TRY TO INSERT ticket_flights")
        
        const ticket_flights_data= [ticket_num_data,flight_id,total_amount];
        const sql_ticket_flights= `INSERT INTO LZHK6O.ticket_flights (ticket_no,flight_id,fare_conditions,amount) VALUES ($1,$2,'Economy',$3) RETURNING *`;
        const data_3=await client.query(sql_ticket_flights,ticket_flights_data);
        
        //console.log("TRY TO INSERT payment")
        
        const payment_data=[ticket_num_data,credit_card,code,total_amount]
        const sql_payment=`INSERT INTO LZHK6O.payment (ticket_no,credit_card_num,discount_code,amount_charge,pay_date) VALUES ($1,$2,$3,$4,current_timestamp)`
        const data_5= await client.query(sql_payment,payment_data)

        //console.log("TRY TO INSERT boarding_passes")
        const sql_boarding_passes = `INSERT INTO LZHK6O.boarding_passes (ticket_no,flight_id,seat_no) VALUES ($1,$2,$3) RETURNING *`;
        const boarding_passes_data=[ticket_num_data,flight_id,"N/A"]
        const data_4=await client.query(sql_boarding_passes,boarding_passes_data);

        //console.log("TRY TO INSER CHECK-in")
        const sql_checkin=`INSERT INTO LZHK6O.check_in (ticket_no,reserved_seat) VALUES ($1,'N')`
        const data_6= await client.query(sql_checkin,[ticket_num_data]);
        //console.log("UPDATED bookings ")
        const sql_flights_SA= `UPDATE LZHK6O.flights SET seats_available=seats_available-1 WHERE flight_id=$1`;
        await client.query(sql_flights_SA,[flight_id]);
        const sql_flights_SB = `UPDATE LZHK6O.flights SET seats_booked=seats_booked+1 WHERE flight_id=$1`;
        await client.query(sql_flights_SB,[flight_id]);
        await client.query(`COMMIT`);
        res.json(data_3)
        
        const start=`BEGIN;\n`
        const sql_bookings_v2=`INSERT INTO LZHK6O.bookings (total_amount,book_date) VALUES(${total_amount},current_timestamp)\n`
        const sql_ticket_v2=`INSERT INTO LZHK6O.ticket (book_ref,passenger_first_name,passenger_last_name,email,phone) VALUES (${book_ref_data},${passenger_first_name},${passenger_last_name},${email},${phone});\n`;
        const sql_ticket_flights_v2=`INSERT INTO LZHK6O.ticket_flights (ticket_no,flight_id,fare_conditions,amount) VALUES (${ticket_num_data},${flight_id},'Economy',${total_amount});\n`;
        const sql_payment_v2=`INSERT INTO LZHK6O.payment (ticket_no,credit_card_num,discount_code,amount_charge,pay_date) VALUES (${ticket_num_data},${credit_card},${code},${total_amount},current_timestamp);\n`
        const sql_boarding_passes_v2=`INSERT INTO LZHK6O.boarding_passes (ticket_no,flight_id,seat_no) VALUES (${ticket_num_data},${flight_id},'N/A');\n`;
        const sql_checkin_v2=`INSERT INTO LZHK6O.check_in (ticket_no,num_luggages,reserved_seat) VALUES (${ticket_num_data},0,'N')\n`
        const sql_update=`UPDATE LZHK6O.flights SET seats_available=seats_available-1 WHERE flight_id=${flight_id};\n`;
        const sql_update_v2=`UPDATE LZHK6O.flights SET seats_booked=seats_booked+1 WHERE flight_id=${flight_id};\n`;
        const commit_sql=`COMMIT;\n\n`
       
        fs.appendFile('transaction.sql',start+sql_bookings_v2+sql_ticket_v2+sql_ticket_flights_v2+sql_payment_v2+sql_boarding_passes_v2+sql_checkin_v2+sql_update+sql_update_v2+commit_sql,(err)=>{
            if(err) throw err;
        })
        
        //var merge=JSON.parse((JSON.stringify(data_1) + JSON.stringify(data_2)).replace(/}{/g,","))
        
        //res.end()
    }catch(err){
        await client.query(`ROLLBACK`);
        throw err;
    }finally{
        //console.log("connection");
        client.release(); 
    }
});


///CODE for: flight.html///
app.get('/indirect/:id',async(req,res)=>{

    try{
        const {id}=req.params;
        const respData=await pool.query(`SELECT * FROM LZHK6O.indirect WHERE flight_id=$1`,[id])
        res.json(respData.rows);
        fs.appendFile(`query.sql`,`SELECT * FROM LZHK6O.indirect WHERE flight_id=${id};\n`,(err)=>{
            if(err) throw err;
        })
    }
    catch(err){
        console.log(err.message);
    }
})

app.get('/roundtrip/:id',async(req,res)=>{
    
    try{
        const {id}=req.params;
        const respData=await pool.query(`SELECT * FROM LZHK6O.round_trips WHERE flight_id=$1`,[id])
        res.json(respData.rows);
        fs.appendFile(`query.sql`,`SELECT * FROM LZHK6O.round_trips WHERE flight_id=${id};\n`, (err)=>{
            if(err) throw err;
        })
    }
    catch(err){
        console.log(err.message);
    }
})

app.get('/flightstart/:id/flightend/:id2/date/:id3',async(req,res)=>{
    try{
        //id=HOU
        //id2=OCT
        const {id} =req.params;
        const {id2}=req.params;
        const {id3}=req.params;
        const data= [id,id2];
        //for some odd reason id3 need to use ${} if not a error occurs upon using %%
        
        const respData= await pool.query(`SELECT * FROM LZHK6O.flights WHERE departure_airport=$1 AND arrival_airport=$2 AND scheduled_departure::text LIKE '%${id3}%' `,
        data);
        res.json(respData.rows);
        fs.appendFile(`query.sql`,`SELECT * FROM LZHK6O.flights WHERE departure_airport=${id} AND arrival_airport=${id2} AND scheduled_departure::text LIKE '%${id3}%';\n`,(err)=>{
            if(err) throw err;
        })
    }catch(err){
        console.log(err.message);
    }
});



//show scheduled_departure, scheduled arrival from flights
// and show gate and seat_no from boarding_passes

app.get('/flight/:id/board_pas/:id2',async(req,res)=>{
    try{
        const {id}=req.params;
        const {id2}=req.params;
        const data=[id,id2];
        const respData=await pool.query(`select A.scheduled_departure,A.scheduled_arrival,B.gate 
        FROM LZHK6O.flights AS A,LZHK6O.boarding_passes AS B where A.flight_id=$1 AND B.ticket_no=$2;`,
        data);
        res.json(respData.rows);
        fs.appendFile(`query.sql`,`select A.scheduled_departure,A.scheduled_arrival,B.gate 
        FROM LZHK6O.flights AS A,LZHK6O.boarding_passes AS B where A.flight_id=${id} AND B.ticket_no=${id2};\n`,(err)=>{
            if(err) throw err;
        })
    }
    catch(err){
        console.log(err.message);
    }
});

app.get('/history/:id', async(req,res)=>{
    try{
        const {id}=req.params
        const respData= await pool.query(`select A.ticket_no,B.flight_id,C.reserved_seat,D.seat_no,F.scheduled_departure,F.scheduled_arrival,F.departure_airport,F.arrival_airport 
        FROM LZHK6O.ticket AS A,LZHK6O.ticket_flights AS B,LZHK6O.check_in AS C,LZHK6O.boarding_passes AS D, LZHK6O.flights AS F 
        where email=$1 AND A.ticket_no=B.ticket_no AND A.ticket_no=C.ticket_no AND A.ticket_no=D.ticket_no AND B.flight_id=F.flight_id  `,
        [id]);
        res.json(respData.rows)
        fs.appendFile(`query.sql`,`select A.ticket_no,B.flight_id,C.reserved_seat,D.seat_no,F.scheduled_departure,F.scheduled_arrival,F.departure_airport,F.arrival_airport\n 
        FROM LZHK6O.ticket AS A,LZHK6O.ticket_flights AS B,LZHK6O.check_in AS C,LZHK6O.boarding_passes AS D, LZHK6O.flights AS F\n
        WHERE email=${id} AND\n A.ticket_no=B.ticket_no AND\n A.ticket_no=C.ticket_no AND\n A.ticket_no=D.ticket_no AND\n B.flight_id=F.flight_id;\n`, (err)=>{
            if(err) throw err;
        })


    }
    catch(err){
        console.log(err.message)
    }
})



app.delete("/refund/:id/refund2/:id2",async(req,res)=>{
    const client = await pool.connect();
    try{
        
        const {id}=req.params;
        const {id2}=req.params;
        await client.query(`BEGIN`)
        const table=await client.query (`SELECT book_ref FROM LZHK6O.ticket where ticket_no=$1`,[id]);
        const table2=await client.query(`SELECT amount_charge from LZHK6O.payment where ticket_no=$1`,[id]);
        const book_no=table.rows[0].book_ref;
        const money=table2.rows[0].amount_charge;
        
        await client.query(`DELETE FROM LZHK6O.check_in WHERE ticket_no=$1`,[id]);
        
        await client.query(`DELETE FROM LZHK6O.boarding_passes WHERE ticket_no=$1 `,[id]);
        await client.query(`DELETE FROM LZHK6O.ticket_flights WHERE ticket_no=$1`,[id]);
      
        await client.query(`DELETE FROM LZHK6O.payment WHERE ticket_no=$1`,[id]);
        await client.query(`DELETE FROM LZHK6O.ticket WHERE ticket_no=$1`,[id]);
        await client.query(`DELETE FROM LZHK6O.bookings WHERE book_ref=$1`,[book_no]);
        await client.query(`UPDATE LZHK6O.flights SET seats_available=seats_available+1 WHERE flight_id=$1`,[id2]);
        await client.query(`UPDATE LZHK6O.flights SET seats_booked=seats_booked+1 WHERE flight_id=$1`,[id2]);
    
        
        await client.query(`COMMIT`);
        res.json("REFUND");
        
        sql_start=`BEGIN;\n`
        sql_delete5=`DELETE FROM LZHK6O.check_in WHERE ticket_no=${id};\n`
        sql_delete1=`DELETE FROM LZHK6O.boarding_passes WHERE ticket_no=${id};\n`
        sql_delete2=`DELETE FROM LZHK6O.ticket_flights WHERE ticket_no=${id};\n`
        sql_delete3=`DELETE FROM LZHK6O.ticket WHERE ticket_no=${id};\n`
        sql_delete4=`DELETE FROM LZHK6O.bookings WHERE book_ref=${book_no};\n`
        sql_update=`UPDATE LZHK6O.flights SET seats_available=seats_available+1 WHERE flight_id=${id2};\n`
        sql_update2=`UPDATE LZHK6O.flights SET seats_booked=seats_booked+1 WHERE flight_id=${id2};\n`
        sql_end=`COMMIT;\n\n`
        fs.appendFile('transaction.sql',sql_start+sql_delete5+sql_delete1+sql_delete2+sql_delete3+sql_delete4+sql_update+sql_update2+sql_end,(err)=>{
            if(err) throw err;
        })
        
    }
    catch(err){
        await client.query("ROLLBACK");
        throw err;
    }
    finally{
        client.release();
    }
})


//checkin.html select * from boarding_passes WHERE ticket_no=1 AND seat_no='N/A';
app.get('/seat/:id/first_name/:id2/last_name/:id3',async(req,res)=>{
    try{
        const {id}=req.params;
        const {id2}=req.params;
        const {id3}=req.params;
        const data=[id,id2,id3]
        const respData= await pool.query(`SELECT * FROM LZHK6O.ticket where ticket_no=$1 AND passenger_first_name=$2 AND passenger_last_name=$3`
        ,data)
        res.json(respData.rows)
        fs.appendFile('query.sql',`SELECT * FROM LZHK6O.ticket where ticket_no=${id} AND passenger_first_name=${id2} AND passenger_last_name=${id3};\n`, (err)=>{
            if(err) throw err;
        })
       
    }
    catch(err){
        console.log(err.message)
    }
})

app.get('/checkSeat/:id',async(req,res)=>{
    try{
        const {id}=req.params;
        const respData= await pool.query(`select * from LZHK6O.boarding_passes WHERE ticket_no=$1 AND seat_no='N/A'`
        ,[id]);
        res.json(respData.rows)
       fs.appendFile('query.sql', `select * from LZHK6O.boarding_passes WHERE ticket_no=${id} AND seat_no='N/A';\n`,(err)=>{
           if(err) throw err;
       })
    }
    catch(err){
        console.log(err);
    }
});

app.put("/reserve/:id",async(req,res)=>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN')
        const {id}= req.params
        const data= await client.query(`select C.* FROM LZHK6O.ticket_flights AS A, LZHK6O.flights AS B, LZHK6O.seats AS C 
        WHERE A.ticket_no=$1 AND B.flight_id=A.flight_id AND C.aircraft_code=B.aircraft_code 
        AND C.available='TRUE' FETCH FIRST ROW ONLY`,[id])
        const seatInfo=data.rows[0].seat_no;
        const seat_craft=data.rows[0].aircraft_code;
        const sql_update3= await client.query(`UPDATE LZHK6O.check_in SET reserved_seat='Y' WHERE ticket_no=$1`,[id])
        const sql_update= await client.query(`UPDATE LZHK6O.boarding_passes SET seat_no=$1 WHERE ticket_no=$2`,[seatInfo,id])
        const sql_update2= await client.query(`UPDATE LZHK6O.seats SET available='FALSE' WHERE seat_no=$1 AND aircraft_code=$2`,[seatInfo,seat_craft])
        await client.query(`COMMIT;`)
        
        res.json(`${seatInfo}`)
        
        const sql_query=`UPDATE LZHK6O.check_in SET reserved_seat='Y' WHERE ticket_no=${id};\n`
        const sql_query2=`UPDATE LZHK6O.boarding_passes SET seat_no=${seatInfo} WHERE ticket_no=${id};\n`
        const sql_query3=`UPDATE LZHK6O.seats SET available='FALSE' WHERE seat_no=${seatInfo} AND aircraft_code=${seat_craft}\n`
        fs.appendFile('transaction.sql','BEGIN;\n'+sql_query+sql_query2+sql_query3 +'COMMIT;\n',(err)=>{
            if(err) throw err;
        })
        
    }
    catch(err){
        await client.query("ROLLBACK");
        throw err;
    }
    finally{
        client.release();
    }
})


app.listen(5500, () =>{
    console.log("Server has started");
    
});