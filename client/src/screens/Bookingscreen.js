import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import StripeCheckout from "react-stripe-checkout";
import Swal from "sweetalert2";
import Loader from "../components/Loader";
import Error from "../components/Error";

function BookingDetails({ user, fromdate, todate, maxcount }) {
  return (
    <div style={{ textAlign: "left" }}>
      <h1>Booking Details</h1>
      <hr />
      <b>
        <p>Name : {user.name}</p>
        <p>From Date : {fromdate}</p>
        <p>To Date : {todate}</p>
        <p>Max Count : {maxcount}</p>
      </b>
    </div>
  );
}

function AmountDetails({ totalDays, rentperday, totalAmount }) {
  return (
    <div style={{ textAlign: "left" }}>
      <h1>Amount</h1>
      <hr />
      <b>
        <p>Total Days : {totalDays}</p>
        <p>Rent per day : {rentperday}</p>
        <p>Total Amount : {totalAmount}</p>
      </b>
    </div>
  );
}

function Bookingscreen({ match }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const roomid = match.params.roomid;
  const fromdate = moment(match.params.fromdate, "DD-MM-YYYY");
  const todate = moment(match.params.todate, "DD-MM-YYYY");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      window.location.href = "/login";
    }
    async function fetchMyAPI() {
      try {
        setError("");
        setLoading(true);
        const data = (
          await axios.post("/api/rooms/getroombyid", {
            roomid: match.params.roomid,
          })
        ).data;
        setRoom(data);
      } catch (error) {
        console.log(error);
        setError(error);
      }
      setLoading(false);
    }

    fetchMyAPI();
  }, []);

  useEffect(() => {
    const totaldays = moment.duration(todate.diff(fromdate)).asDays() + 1;
    setTotalDays(totaldays);
    setTotalAmount(totalDays * room.rentperday);
  }, [room]);

  const onToken = async (token) => {
    console.log(token);
    const bookingDetails = {
      room,
      userid: JSON.parse(localStorage.getItem("currentUser"))._id,
      fromdate,
      todate,
      totalAmount,
      totaldays: totalDays,
      token,
    };

    try {
      setLoading(true);
      const result = await axios.post("/api/bookings/bookroom",bookingDetails);
      setLoading(false);
      Swal.fire(
        "Congratulations",
        "Your Room Booked Successfully",
        "success"
      ).then((result) => {
        window.location.href = "/home";
      });
    } catch (error) {
      setError(error);
      Swal.fire("Opps", "Error:" + error, "error");
    }
    setLoading(false);
  };

  return (
    <div className="m-5">
      {loading ? (
        <Loader></Loader>
      ) : error.length > 0 ? (
        <Error msg={error}></Error>
      ) : (
        <div className="row justify-content-center mt-5 bs">
          <div className="col-md-6">
            <img src={room.imageurls[0]} alt="" className="bigimg" />
          </div>
          <div className="col-md-6">
            <BookingDetails
              user={JSON.parse(localStorage.getItem("currentUser"))}
              fromdate={match.params.fromdate}
              todate={match.params.todate}
              maxcount={room.maxcount}
            />
            <AmountDetails
              totalDays={totalDays}
              rentperday={room.rentperday}
              totalAmount={totalAmount}
            />
            
            <StripeCheckout
              amount={totalAmount * 100}
              token={onToken}
              currency="INR"
              stripeKey="pk_test_51O9WBOSIyGgiMQrLCwUPCRbY72ulPsdoF2exIkjRfhcnhxEycbPs0Q1O7L0L71OH88CrmWfznRKlPe1XtCcgoVrD002RemqUt4"
            >
              <button className="btn btn-primary">Pay Now</button>
            </StripeCheckout>
          </div>
          <br>
          </br>
          
        </div>
      )}
    </div>
  );
}

export default Bookingscreen;
