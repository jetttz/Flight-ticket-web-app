

DROP TABLE IF EXISTS LZHK6O.airport CASCADE;
DROP TABLE IF EXISTS LZHK6O.boarding_passes CASCADE;
DROP TABLE IF EXISTS LZHK6O.seats CASCADE;
DROP TABLE IF EXISTS LZHK6O.aircraft CASCADE;
DROP TABLE IF EXISTS LZHK6O.ticket CASCADE;
DROP TABLE IF EXISTS LZHK6O.ticket_flights CASCADE;
DROP TABLE IF EXISTS LZHK6O.bookings CASCADE;
DROP TABLE IF EXISTS LZHK6O.flights CASCADE;
DROP TABLE IF EXISTS LZHK6O.indirect CASCADE;
DROP TABLE IF EXISTS LZHK6O.round_trips CASCADE; 
DROP TABLE IF EXISTS LZHK6O.discount CASCADE;
DROP TABLE IF EXISTS LZHK6O.payment CASCADE;
DROP TABLE IF EXISTS LZHK6O.check_in CASCADE;

CREATE TABLE LZHK6O.aircraft(
    aircraft_code char(3),
    model char(25),
    RANGE integer,
    PRIMARY KEY(aircraft_code),
    CONSTRAINT "flights_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES LZHK6O.aircraft(aircraft_code),
    CONSTRAINT "seats_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES LZHK6O.aircraft(aircraft_code) ON DELETE CASCADE
);
CREATE TABLE LZHK6O.airport (
    airport_code char(3) NOT NULL,
    airport_name char(40),
    city char(20),
    coordinates point,
    timezone text,
    PRIMARY KEY (airport_code)

);

CREATE TABLE LZHK6O.flights (
    flight_id integer NOT NULL,
    flight_no character(6) NOT NULL,
    scheduled_departure timestamp  NOT NULL,
    scheduled_arrival timestamp  NOT NULL,
    departure_airport character(3) NOT NULL,
    arrival_airport character(3) NOT NULL,
    STATUS character varying(20) NOT NULL,
    aircraft_code character(3) NOT NULL,
    seats_available integer NOT NULL,
    seats_booked integer NOT NULL,
    meal CHAR(1) NOT NULL CHECK (meal IN ('Y', 'N')),
    movie CHAR(1) NOT NULL CHECK (movie IN ('Y', 'N')),
    stops varchar(200) NOT NULL,
    amount integer NOT NULL,
    PRIMARY KEY (flight_id),
    CONSTRAINT flights_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES LZHK6O.aircraft(aircraft_code),
    CONSTRAINT flights_arrival_airport_fkey FOREIGN KEY (arrival_airport) REFERENCES LZHK6O.airport(airport_code),
    CONSTRAINT flights_departure_airport_fkey FOREIGN KEY (departure_airport) REFERENCES LZHK6O.airport(airport_code),
    CONSTRAINT flights_check CHECK ((scheduled_arrival > scheduled_departure)),
 
    CONSTRAINT flights_status_check CHECK (
        (
            (STATUS)::text = ANY (
                ARRAY [('On Time'::character varying)::text, ('Delayed'::character varying)::text, ('Departed'::character varying)::text, ('Arrived'::character varying)::text, ('Scheduled'::character varying)::text, ('Cancelled'::character varying)::text]
            )
        )
    )
);

CREATE TABLE LZHK6O.bookings (
    book_ref serial NOT NULL,
    book_date timestamp NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    PRIMARY KEY(book_ref)
);

CREATE TABLE LZHK6O.ticket(
    ticket_no  serial not null,
    book_ref integer  not null, 
    passenger_first_name text,
    passenger_last_name text,
    email char(50),
    phone char(50),
    PRIMARY KEY (ticket_no),
    CONSTRAINT "tickets_book_ref_fkey" FOREIGN KEY (book_ref) REFERENCES LZHK6O.bookings(book_ref)
);


CREATE TABLE LZHK6O.seats (
    aircraft_code char(3) NOT NULL,
    seat_no character varying(4) NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    available boolean,
    PRIMARY KEY (aircraft_code, seat_no),
    CONSTRAINT seats_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES LZHK6O.aircraft(aircraft_code),
    CONSTRAINT seats_fare_conditions_check CHECK (
        (
            (fare_conditions)::text = ANY (
                ARRAY [('Economy'::character varying)::text, ('Comfort'::character varying)::text, ('Business'::character varying)::text]
            )
        )
    )
);


CREATE TABLE LZHK6O.ticket_flights (
    ticket_no integer NOT NULL,
    flight_id integer NOT NULL,
    fare_conditions character varying(10) NOT NULL,
    amount numeric(10, 2) NOT NULL,
    PRIMARY KEY (ticket_no, flight_id),
    CONSTRAINT ticket_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES LZHK6O.flights(flight_id),
    CONSTRAINT ticket_flights_ticket_no_fkey FOREIGN KEY (ticket_no) REFERENCES LZHK6O.ticket(ticket_no),
    CONSTRAINT ticket_flights_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT ticket_flights_fare_conditions_check CHECK (
        (
            (fare_conditions)::text = ANY (
                ARRAY [('Economy'::character varying)::text, ('Comfort'::character varying)::text, ('Business'::character varying)::text]
            )
        )
    )
);


CREATE TABLE LZHK6O.boarding_passes (
    ticket_no integer NOT NULL,
    flight_id integer NOT NULL,
    seat_no character varying(4) NOT NULL,
    gate serial NOT NULL,
    PRIMARY KEY(ticket_no, flight_id),
    CONSTRAINT boarding_passes_ticket_no_fkey FOREIGN KEY (ticket_no, flight_id) REFERENCES LZHK6O.ticket_flights(ticket_no, flight_id)
);
CREATE TABLE LZHK6O.indirect (
    flight_id integer NOT NULL,
    departure_airport char(3) NOT NULL,
    PRIMARY KEY(flight_id),
    CONSTRAINT indirect_flights_id FOREIGN KEY (flight_id) REFERENCES LZHK6O.flights(flight_id),
    CONSTRAINT indirect_flights_airport FOREIGN KEY (departure_airport) REFERENCES LZHK6O.airport(airport_code)
);

CREATE TABLE LZHK6O.round_trips(
  flight_id integer NOT NULL,
  scheduled_departure timestamp NOT NULL,
  scheduled_arrival timestamp NOT NULL,
  PRIMARY KEY(flight_id),
  CONSTRAINT round_trips_id FOREIGN KEY (flight_id) REFERENCES LZHK6O.flights(flight_id)
);

CREATE TABLE LZHK6O.discount (
  discount_code character varying(20) NOT NULL,
  amount decimal(5,2),
  minimum integer,
  PRIMARY KEY (discount_code)
);

CREATE TABLE LZHK6O.payment (
  receipt_id serial,
  ticket_no int NOT NULL,
  credit_card_num int NOT NULL,
  discount_code varchar(20),
  amount_charge int NOT NULL,
  pay_date timestamp NOT NULL,
  PRIMARY KEY (receipt_id, ticket_no),
  CONSTRAINT payment_discount_code FOREIGN KEY (discount_code) REFERENCES LZHK6O.discount(discount_code)
);

CREATE TABLE LZHK6O.check_in  (
  ticket_no int NOT NULL,
  num_luggages serial NOT NULL,
  reserved_seat char(1) NOT NULL CHECK (reserved_seat in ('Y', 'N')),
  PRIMARY KEY (ticket_no),
  CONSTRAINT checkin_ticket_key FOREIGN KEY (ticket_no) REFERENCES LZHK6O.ticket(ticket_no)
);


/*airport table */
INSERT INTO LZHK6O.airport VALUES ('HOU','George Bush Airport','Houston',NULL,'CT');
INSERT INTO LZHK6O.airport VALUES ('JFK','John F Kennedy Airport','New York',NULL,'ET');
INSERT INTO LZHK6O.airport VALUES ('LAX','Los Angeles Airport','Los Angeles',NULL,'PT');
/*INSERT INTO airport VALUES ('ORD', 'O Hare Airport', 'Chicago', NULL, 'CT');
INSERT INTO airport VALUES ('MIA', 'Miami Airport', 'Miami', NULL, 'ET');
*/
/*aircraft*/
INSERT INTO LZHK6O.aircraft VALUES ('773', 'Boeing 777-300', 11100);
INSERT INTO LZHK6O.aircraft VALUES ('763', 'Boeing 767-300', 7900);
INSERT INTO LZHK6O.aircraft VALUES ('SU9', 'Boeing 777-300', 5700);
INSERT INTO LZHK6O.aircraft VALUES ('320', 'Boeing 777-300', 6400);
INSERT INTO LZHK6O.aircraft VALUES ('321', 'Boeing 777-300', 6100);

INSERT INTO LZHK6O.seats VALUES ('773','1A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','1I','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('773','2I','Economy',TRUE);

INSERT INTO LZHK6O.seats VALUES ('320','1A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','1I','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('320','2I','Economy',TRUE);

INSERT INTO LZHK6O.seats VALUES ('763','1A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','1I','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('763','2I','Economy',TRUE);

INSERT INTO LZHK6O.seats VALUES ('SU9','1A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','1I','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('SU9','2I','Economy',TRUE);

INSERT INTO LZHK6O.seats VALUES ('321','1A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','1I','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2A','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2B','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2C','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2D','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2E','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2F','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2G','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2H','Economy',TRUE);
INSERT INTO LZHK6O.seats VALUES ('321','2I','Economy',TRUE);




INSERT INTO LZHK6O.flights VALUES (1001,'PG0010','2020-12-09 09:00:00','2020-12-09 13:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','1stops',200);
INSERT INTO LZHK6O.flights VALUES (2002,'PG1233','2020-12-09 08:50:00','2020-12-09 12:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (3003,'PG2222','2020-12-09 07:50:00','2020-12-09 11:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (4004,'PG3333','2020-12-09 06:50:00','2020-12-09 10:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',500);

INSERT INTO LZHK6O.flights VALUES (5005,'PG4444','2020-12-11 05:50:00','2020-12-11 9:55:00','HOU','JFK','Scheduled','320',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (6006,'PG5555','2020-12-11 04:50:00','2020-12-11 8:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (7007,'PG6666','2020-12-11 03:50:00','2020-12-11 7:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1110,'PG5555','2021-1-10 04:50:00','2021-1-10 8:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','roundtrips',400);
INSERT INTO LZHK6O.flights VALUES (1112,'PG6666','2021-1-10 03:50:00','2021-1-10 7:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1113,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1114,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1115,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1116,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','HOU','JFK','Scheduled','773',50,0,'N','N','nonstops',200);



INSERT INTO LZHK6O.flights VALUES (1004,'PG0040','2020-12-09 09:00:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','320',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1005,'PG0050','2020-12-09 08:50:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','321',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (9999,'PG0050','2020-12-09 07:50:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','321',50,0,'N','N','roundtrips',200);
INSERT INTO LZHK6O.flights VALUES (8888,'PG0050','2020-12-09 06:50:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','321',50,0,'N','N','roundtrips',200);
INSERT INTO LZHK6O.flights VALUES (7777,'PG0040','2020-12-09 09:00:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','320',50,0,'N','N','1stops',200);
INSERT INTO LZHK6O.flights VALUES (6666,'PG0040','2020-12-09 09:00:00','2020-12-09 12:55:00','HOU','LAX','Scheduled','320',50,0,'N','N','1stops',200);

INSERT INTO LZHK6O.flights VALUES (1006,'PG0060','2020-12-11 07:50:00','2020-12-11 12:55:00','HOU','LAX','Scheduled','773',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1007,'PG0070','2020-12-11 06:50:00','2020-12-11 12:55:00','HOU','LAX','Scheduled','763',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1008,'PG0080','2021-1-10 05:50:00','2021-1-10 16:55:00','HOU','LAX','Scheduled','SU9',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1009,'PG0090','2021-1-10 04:50:00','2021-1-10 12:55:00','HOU','LAX','Scheduled','320',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1010,'PG0100','2021-1-10 03:50:00','2021-1-10 12:55:00','HOU','LAX','Scheduled','321',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1117,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','HOU','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1118,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','HOU','LAX','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1119,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','HOU','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1120,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','HOU','LAX','Scheduled','773',50,0,'N','N','nonstops',200);



INSERT INTO LZHK6O.flights VALUES (1121,'PG0010','2020-12-09 09:00:00','2020-12-09 13:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1122,'PG1233','2020-12-09 08:50:00','2020-12-09 12:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1123,'PG2222','2020-12-09 07:50:00','2020-12-09 11:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1124,'PG3333','2020-12-09 06:50:00','2020-12-09 10:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','roundtrips',500);

INSERT INTO LZHK6O.flights VALUES (1125,'PG4444','2020-12-11 05:50:00','2020-12-11 9:55:00','JFK','HOU','Scheduled','320',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1126,'PG5555','2020-12-11 04:50:00','2020-12-11 8:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1127,'PG6666','2020-12-11 03:50:00','2020-12-11 7:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1128,'PG5555','2021-1-10 04:50:00','2021-1-10 8:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1129,'PG6666','2021-1-10 03:50:00','2021-1-10 7:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1130,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1131,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1132,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1133,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','JFK','HOU','Scheduled','773',50,0,'N','N','nonstops',200);


INSERT INTO LZHK6O.flights VALUES (1002,'PG0020','2020-12-11 09:50:00','2020-12-11 13:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1100,'PG0030','2020-12-11 08:50:00','2020-12-11 12:55:00','JFK','HOU','Scheduled','SU9',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1101,'PG0020','2020-12-11 07:50:00','2020-12-11 11:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1102,'PG0020','2020-12-11 06:50:00','2020-12-11 10:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1103,'PG0020','2020-12-11 05:50:00','2020-12-11 9:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1104,'PG0020','2020-12-11 04:50:00','2020-12-11 8:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1105,'PG0020','2020-12-11 03:50:00','2020-12-11 7:55:00','JFK','HOU','Scheduled','763',50,0,'N','N','nonstops',200);





INSERT INTO LZHK6O.flights VALUES (1134,'PG0010','2020-12-09 09:00:00','2020-12-09 13:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1135,'PG1233','2020-12-09 08:50:00','2020-12-09 12:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1136,'PG2222','2020-12-09 07:50:00','2020-12-09 11:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1137,'PG3333','2020-12-09 06:50:00','2020-12-09 10:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',500);

INSERT INTO LZHK6O.flights VALUES (1138,'PG4444','2020-12-11 05:50:00','2020-12-11 9:55:00','JFK','LAX','Scheduled','320',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1139,'PG5555','2020-12-11 04:50:00','2020-12-11 8:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1140,'PG6666','2020-12-11 03:50:00','2020-12-11 7:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1141,'PG5555','2021-1-10 04:50:00','2021-1-10 8:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1142,'PG6666','2021-1-10 03:50:00','2021-1-10 7:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1143,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1144,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1145,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1146,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','JFK','LAX','Scheduled','773',50,0,'N','N','nonstops',200);


INSERT INTO LZHK6O.flights VALUES (1147,'PG0010','2020-12-09 09:00:00','2020-12-09 13:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1148,'PG1233','2020-12-09 08:50:00','2020-12-09 12:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1149,'PG2222','2020-12-09 07:50:00','2020-12-09 11:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','roundtrips',400);
INSERT INTO LZHK6O.flights VALUES (1150,'PG3333','2020-12-09 06:50:00','2020-12-09 10:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',500);

INSERT INTO LZHK6O.flights VALUES (1151,'PG4444','2020-12-11 05:50:00','2020-12-11 9:55:00','LAX','HOU','Scheduled','320',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1152,'PG5555','2020-12-11 04:50:00','2020-12-11 8:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1153,'PG6666','2020-12-11 03:50:00','2020-12-11 7:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1154,'PG5555','2021-1-10 04:50:00','2021-1-10 8:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1155,'PG6666','2021-1-10 03:50:00','2021-1-10 7:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1156,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1157,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1158,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1159,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','LAX','HOU','Scheduled','773',50,0,'N','N','nonstops',200);


INSERT INTO LZHK6O.flights VALUES (1160,'PG0010','2020-12-09 09:00:00','2020-12-09 13:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',200);
INSERT INTO LZHK6O.flights VALUES (1161,'PG1233','2020-12-09 08:50:00','2020-12-09 12:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1162,'PG2222','2020-12-09 07:50:00','2020-12-09 11:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1163,'PG3333','2020-12-09 06:50:00','2020-12-09 10:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',500);

INSERT INTO LZHK6O.flights VALUES (1164,'PG4444','2020-12-11 05:50:00','2020-12-11 9:55:00','LAX','JFK','Scheduled','320',50,0,'N','N','nonstops',300);
INSERT INTO LZHK6O.flights VALUES (1165,'PG5555','2020-12-11 04:50:00','2020-12-11 8:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1166,'PG6666','2020-12-11 03:50:00','2020-12-11 7:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1167,'PG5555','2021-1-10 04:50:00','2021-1-10 8:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1168,'PG6666','2021-1-10 03:50:00','2021-1-10 7:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1169,'PG5555','2021-1-12 04:50:00','2021-1-12 8:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1170,'PG6666','2021-1-12 03:50:00','2021-1-12 7:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',200);

INSERT INTO LZHK6O.flights VALUES (1171,'PG5555','2021-1-15 04:50:00','2021-1-15 7:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',400);
INSERT INTO LZHK6O.flights VALUES (1172,'PG6666','2021-1-15 03:50:00','2021-1-15 6:55:00','LAX','JFK','Scheduled','773',50,0,'N','N','nonstops',200);


INSERT INTO LZHK6O.indirect VALUES(1001,'LAX');

INSERT INTO LZHK6O.indirect VALUES(7777,'JFK');
INSERT INTO LZHK6O.indirect VALUES(6666,'JFK');

INSERT INTO LZHK6O.indirect VALUES(3003,'LAX');

INSERT INTO LZHK6O.indirect VALUES(1002,'LAX');

INSERT INTO LZHK6O.indirect VALUES(4004,'LAX');

INSERT INTO LZHK6O.discount VALUES ('Q1W2E3',.05,200);
INSERT INTO LZHK6O.discount VALUES ('X1S2W3',.10,500);
INSERT INTO LZHK6O.discount VALUES ('COSC80',.15,700);
INSERT INTO LZHK6O.discount VALUES ('upass3380',.10,700);
INSERT INTO LZHK6O.discount VALUES ('NONEQA',0,0);


INSERT INTO LZHK6O.round_trips VALUES (8888,'2020-12-09 8:55:00','2020-12-09 12:50:00');

INSERT INTO LZHK6O.round_trips VALUES (9999,'2020-12-09 8:55:00','2020-12-09 12:50:00');

INSERT INTO LZHK6O.round_trips VALUES (1110,'2021-1-12 8:55:00','2021-1-12 12:50:00');

INSERT INTO LZHK6O.round_trips VALUES (1124,'2020-12-12 10:55:00','2020-12-12 13:50:00');

INSERT INTO LZHK6O.round_trips VALUES (1149,'2020-12-13 10:55:00','2020-12-13 12:50:00');