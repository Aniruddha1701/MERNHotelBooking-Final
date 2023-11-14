// Homescreen.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "antd/dist/antd.css";
import { DatePicker } from "antd";
import moment from "moment";
import "./Homescreen.css";
import Room from "../components/Room";
import Loader from "../components/Loader";
import Error from "../components/Error";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Homescreen.css"; // Import your custom styles here

AOS.init({
  duration: 1000,
});

const { RangePicker } = DatePicker;
const dateFormat = "DD-MM-YYYY";

const Homescreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState([]);
  const [duplicateRooms, setDuplicateRooms] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("anywhere");

  useEffect(() => {
    const fetchMyAPI = async () => {
      try {
        setError("");
        setLoading(true);
        const data = (
          await axios.get(`/api/rooms/getallrooms?location=${selectedLocation}`)
        ).data;
        setRooms(data);
        setDuplicateRooms(data);
      } catch (error) {
        console.error(error);
        setError(error);
      }
      setLoading(false);
    };

    fetchMyAPI();
  }, [selectedLocation]);

  const filterByDate = (dates) => {
    try {
      setFromDate(moment(dates[0]).format(dateFormat));
      setToDate(moment(dates[1]).format(dateFormat));

      const tempRooms = duplicateRooms.filter((room) => {
        const availability = room.currentbookings.every((booking) => {
          return (
            !moment(fromDate).isBetween(booking.fromdate, booking.todate) &&
            !moment(toDate).isBetween(booking.fromdate, booking.todate) &&
            moment(fromDate).format(dateFormat) !== booking.fromdate &&
            moment(fromDate).format(dateFormat) !== booking.todate &&
            moment(toDate).format(dateFormat) !== booking.fromdate &&
            moment(toDate).format(dateFormat) !== booking.todate
          );
        });

        return availability || room.currentbookings.length === 0;
      });

      setRooms(tempRooms);
    } catch (error) {
      console.error(error);
    }
  };

  const filterByType = (selectedType) => {
    const tempRooms =
      selectedType !== "all"
        ? duplicateRooms.filter((x) => x.type.toLowerCase() === selectedType.toLowerCase())
        : duplicateRooms;

    setRooms(tempRooms);
  };

  const locationOptions = [
    { value: "anywhere", label: "Anywhere in India" },
    // Add more location options as needed
  ];

  return (
    <div className="container">
      <div className="row mt-5 bs">
        <div className="col-md-3">
          <RangePicker format={dateFormat} onChange={filterByDate} />
        </div>

        <div className="col-md-3 select-box">
          <select
            className="form-control"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 select-box">
          <select
            className="form-control"
            onChange={(e) => filterByType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="delux">Delux</option>
            <option value="non-delux">Non-Delux</option>
          </select>
        </div>
      </div>

      <div className="row justify-content-center mt-5">
        {loading ? (
          <Loader />
        ) : error.length > 0 ? (
          <Error msg={error} />
        ) : (
          rooms.map((x) => (
            <div className="col-md-9 mt-3" data-aos="flip-down" key={x.id}>
              <Room room={x} fromDate={fromDate} toDate={toDate} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Homescreen;
