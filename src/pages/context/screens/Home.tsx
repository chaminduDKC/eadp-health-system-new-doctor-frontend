import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {useEffect, useState} from "react";
import {Button, List} from "@mui/material";
import {TimeClock, TimePicker} from "@mui/x-date-pickers";
import axiosInstance from "../../../axios/axiosInstance.ts";
import { motion, AnimatePresence } from "framer-motion";
import {Alert, Collapse} from "@mui/material";
import AlertHook from '../../../alert/Alert.ts'
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import * as React from "react";

// Animation
const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};
type Time = {
    id: number;
    name:string
}
const Home:React.FC = () => {
    const {openAlert, alertStatus, showAlert, closeAlert} = AlertHook();

    const [date, setDate] = useState<Dayjs | null>(dayjs(new Date()));

    const [time, setTime] = useState<Dayjs>(dayjs());
    const [docId, setDocId] = useState<string>("");


    useEffect(() => {
        const interval = setInterval(() => {
            setTime(dayjs());
        }, 6000); // update

        return () => clearInterval(interval);
    });

    useEffect(() => {
        fetchMe().then(() => {
            console.log("my details fetched successfully");
        }).catch(()=>{
            showAlert("failed-my-data")
        });
    }, []);
    
    
    // --------------------------------------



    const [timeSlots, setTimeSlots] = useState<Time[]>([])
    const [alreadyBookedTimeSlots, setAlreadyBookedTimeSlots] = useState<[]>([])

    const availabilityUrl = import.meta.env.VITE_AVAILABILITY_API;
    const bookingUrl = import.meta.env.VITE_BOOKING_API;
    const doctorUrl = import.meta.env.VITE_DOCTOR_API;

    const fetchTimeSlots = async (docId:string, date:string) => {
        try {
            const response = await axiosInstance.get(`${availabilityUrl}/get-availabilities-by-date-and-doctor/${docId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
                params: {date: date}
            });
            if (response.data.data.length === 0) {
                showAlert("failed-not-selected-or-available")
                setTimeSlots([]);
                return;
            }
            const slots = response.data.data.map((slot:string, idx:number) => ({id: idx, name: slot}));
            setTimeSlots(slots);
        } catch (error) {
            showAlert("failed-fetch-time-slot");
            console.error("Error fetching time slots:", error);
        }
    }
    // --------------------------------------
    const fetchAlreadyBookedTimes = async (docId:string, date:string)=>{
        await axiosInstance.get(`${availabilityUrl}/get-booked-time-slots/${docId}`, {params:{date:date}}).then(res=>{
            if(res.data.data.length === 0){
                showAlert("no-booked-times-for-doctor")
                setAlreadyBookedTimeSlots([])
            } else {
                setAlreadyBookedTimeSlots(res.data.data)
            }
        }).catch(err=>{
            showAlert("failed-booked-time")
            console.log(err)
        })
    }
    // --------------------------------------

    const [availableDatesByDoctor, setAvailableDatesByDoctor] = useState<string[]>([])
    const fetchSelectedDates = async (docId:string) =>{
        await axiosInstance.get(`${bookingUrl}/get-available-dates-by-doctor/${docId}`).then(res=>{

            if(res.data.data.length === 0){
                showAlert("no-available-dates-for-you")
                setAvailableDatesByDoctor([])

            } else {
                setAvailableDatesByDoctor(res.data.data)
            }
        }).catch((error)=>{
            showAlert("failed-fetch-available-dates")
            console.log(error)
        })
    }
    // --------------------------------------

    const fetchMe = async ()=>{
        await axiosInstance.get(`${doctorUrl}/auth-doctor-details`, {headers:{Authorization : `Bearer ${localStorage.getItem("access_token")}`}}).then(res=>{
            setDocId(res.data.data.doctorId);
            fetchSelectedDates(res.data.data.doctorId)
            fetchTimeSlots(res.data.data.doctorId, date?.format("YYYY-MM-DD")|| "")
            fetchAlreadyBookedTimes(res.data.data.doctorId, date?.format("YYYY-MM-DD")|| "")
        }).catch(err=>{
            showAlert("failed")
            console.log(err)
        })
    }
    // --------------------------------------

    const [newDate, setNewDate] = useState<Dayjs | null>(dayjs(new Date()))
    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs() .add(1, 'hour'));
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().add(1, 'hour'));


    // ---------------------------------------
    const handleTimeSlots = async ()=>{
        if (!newDate || !startTime || !endTime) {
            showAlert("please-select-date-and-time")
            return;
        }
        if(availableDatesByDoctor.includes(newDate.format("YYYY-MM-DD"))){
            showAlert("already-selected-date")
            return
        }
        if(startTime?.format("HH:MM") === endTime?.format("HH:MM")){
            showAlert("same-time")
            return
        } else{
            const formattedDate = newDate.format("YYYY-MM-DD");
            const formattedStartTime = startTime.format("HH:mm");
            const formattedEndTime = endTime.format("HH:mm");

            try {
                const requestBody = {
                    doctorId:docId,
                    date:formattedDate,
                    startTime:formattedStartTime,
                    endTime:formattedEndTime
                }
                const response = await axiosInstance.post(`${availabilityUrl}/save-availabilities`, requestBody);
                console.log(response)
                showAlert("success-create-time")
                fetchTimeSlots(docId, date?.format("YYYY-MM-DD"));
                fetchSelectedDates(docId);
                fetchAlreadyBookedTimes(docId, date?.format("YYYY-MM-DD"))
            } catch (error) {
                showAlert("failed-create-time")
                console.error("Error creating time slot:", error);
            }
        }


    }
    // ---------------------------------------
    return (
        <Box sx={{width:"100%",mx:"auto", marginTop:"60px", marginBottom:{
                xl:"50px",
                lg:"460px",
                md:"50px",
                sm:"50px",
                xs:"50px",
            }, padding:{
                xl:"20px 200px",
                lg:"20px 100px",
                md:"20px 20px",
                sm:"20px 50px",
                xs:"20px 5px",
            },}}>

            {/*alert*/}
            <Collapse  sx={{
                width: { xs: '96%', sm: '80%', md: '60%' },
                margin: "0 auto",
                position: "fixed",
                top: "85px",
                right: 0,
                left: 0,
                zIndex: 14,
                px: { xs: 1, sm: 0 }
            }} in={openAlert}>
                <Alert
                    severity={alertStatus.includes("success") ? "success" : alertStatus.includes("warning") ? "warning" : "error"}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            onClick={closeAlert}
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                    sx={{
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                        alignItems: "center"
                    }}
                >
                    {alertStatus === "failed-my-data" && "Failed to load some data. Try again."}
                    {alertStatus === "failed" && "Failed to load some data. Try again."}
                    {alertStatus === "failed-create-time" && "Failed to make the selection. Try again."}
                    {alertStatus === "success-create-time" && "Selection created successfully."}
                    {alertStatus === "failed-not-selected-or-available" && "No available time for selected day."}
                    {alertStatus === "failed-fetch-time-slot" && "Failed to available times. Please try again."}
                    {alertStatus === "failed-booked-time" && "Failed to load booked times. Please try again."}
                    {alertStatus === "failed-fetch-available-dates" && "Failed to load available dates. Please try again."}
                    {alertStatus === "no-booked-times-for-doctor" && "No appointments available for selected date."}
                    {alertStatus === "no-available-dates-for-you" && "You are not selected your available dates yet. Please select a date."}
                    {alertStatus === "same-time" && "Select correct start and end time."}
                    {alertStatus === "already-selected-date" && "This date is already selected. Choose another day and try again."}

                </Alert>
            </Collapse>
            {/*alert*/}

            <Typography variant="h3" sx={{fontSize:{xs:"30px"},color:"primary.main", textAlign:"center", marginBottom:"20px", fontWeight:"bold"}}> Available Dates </Typography>
            <Box sx={{
                display: "flex",

                flexDirection:{ xs: "column", // Stack
                    sm: "column",
                    md:"column",
                    lg:"column",
                    xl:"row"
                },
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                gap:4,
                height:{
                    xs: "100%",
                    sm: "100%",
                    md:"100%",
                    lg:"400px",
                    xl:"400px"
                },


            }}>
                <Box flex={2} sx={{
                  borderRadius:3,
                    display:"flex",
                    width:{
                        xs: "100%",
                        sm: "90%",
                        md:"80%",
                        lg:"75%",
                        xl:"70%"
                    },
                    paddingY:3,
                    height:"100%",
                    flexDirection:{
                        xs: "column",
                        sm: "column",
                        md:"column",
                        lg:"row",
                        xl:"row"
                    },
                    backgroundColor:"background.paper",
                    mx:"auto"
                }}>
                    <LocalizationProvider   dateAdapter={AdapterDayjs}>
                        <DateCalendar disablePast
                                      slotProps={{
                                          day: {
                                              sx: {
                                                  fontSize: {
                                                        xs: '1.4rem',

                                                  },
                                                  width: {

                                                      xl: 37,
                                                  },
                                                  height: {

                                                      xl: 37,
                                                  },
                                              },
                                          },
                                      }}
                                      value={date}
                                      onChange={(newValue) => {
                                          setDate(newValue);
                                          const formattedDate = newValue?.format("YYYY-MM-DD") || "";
                                          fetchTimeSlots(docId, formattedDate).then(() => {
                                              fetchAlreadyBookedTimes(docId, formattedDate).then(() => {
                                                  console.log("success");
                                              });
                                          });
                                      }}
                                      dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
                                      shouldDisableDate={(d)=>{
                                          const iso:string = d.format("YYYY-MM-DD")
                                          return !availableDatesByDoctor.includes(iso);
                                      }}
                        />
                        <Box>
                            <TimeClock  disabled value={time} sx={{

                            }} />
                            <Typography textAlign="center" marginTop="20px" variant="h4" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                {time.format("HH:mm")}
                            </Typography>
                        </Box>

                    </LocalizationProvider>


                </Box>
                <List sx={{

                    height:"100%",
                    flex:"1",
                    borderRadius:3,
                    padding:2,
                    overflow:{
                        lg:"",
                        xl:"hidden",
                        xs:"auto",
                        sm:"auto",
                        md:"initial",

                    },
                    width:{
                        xs: "100%",
                        sm: "90%",
                        md:"80%",
                        lg:"75%",
                        xl:"70%"
                    },
                    maxHeight:"100vh",
                    backgroundColor:"background.paper",
                    mx:"auto",
                }}>
                    <Typography display="flex" alignItems="start" marginBottom={3} variant="h4" sx={{
                        color:"primary.main",
                        justifyContent:"center"
                    }}>
                        {date?.format("YYYY-MM-DD")}
                        <Typography variant="h6" marginLeft={1} sx={{
                            color:"text.primary",
                        }}>  {new Date().toDateString() === date?.toDate().toDateString() ? "Today" : ""}</Typography>

                    </Typography>
                    <Box display="flex" justifyContent="space-around" alignItems="start" gap={3}>
                        <Box
                            gap={3}
                            sx={{


                            }}
                        >
                            <Typography sx={{
                                borderRadius:"10px 10px 10px 0",
                                border:"1px solid",
                                borderColor:"primary.main",
                                padding:"0px 10px",
                            }}  variant="h6" marginBottom={1}>Available times</Typography>

                            <AnimatePresence mode="popLayout">
                                <Box sx={{ maxHeight: "300px",
                                    overflowY: "auto", // allow vertical scrolling
                                    scrollbarWidth: "none", // Firefox
                                    "&::-webkit-scrollbar": {
                                        display: "none", // Chrome, Safari
                                    },

                                }}>
                                {timeSlots.length === 0 ? (

                                        <Typography
                                            sx={{
                                                color: "secondary.main",
                                                transition: "all 0.3s ease-in-out",
                                            }}

                                        >
                                            Empty List..!
                                        </Typography>

                                ) : (
                                    timeSlots.map((time, index) => (
                                        <motion.div
                                            key={time.id}
                                            variants={itemVariant}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <Typography
                                                display="flex"
                                                sx={{
                                                    fontFamily: "monospace",
                                                    transition: "all 0.3s ease-in-out",
                                                    overflow:"hidden"
                                                }}
                                                fontSize={25}
                                                marginBottom={1}
                                                gap={1}
                                            >
                                                <Typography
                                                    sx={{
                                                        color: "primary.main",
                                                        fontSize: "25px",
                                                        transition: "all 0.3s ease-in-out",
                                                        overflow:"hidden"
                                                    }}
                                                >
                                                    {index + 1}.
                                                </Typography>
                                                {time?.name}
                                            </Typography>
                                        </motion.div>
                                    ))
                                )}
                                </Box>
                            </AnimatePresence>

                        </Box>
                        <Box
                            gap={3}
                            sx={{

                            }}
                        >
                            <Typography sx={{
                                borderRadius:"10px 10px 0px 10px",
                                border:"1px solid",
                                borderColor:"primary.main",
                                padding:"0px 10px",
                            }} marginBottom={1} variant="h6" >Booked times</Typography>

                            <AnimatePresence mode="popLayout">
                                <Box sx={{maxHeight: "300px",
                                    overflowY: "auto", // allow vertical scrolling
                                    scrollbarWidth: "none", // Firefox
                                    "&::-webkit-scrollbar": {
                                        display: "none", // Chrome, Safari
                                    },
                                    overflow:"hidden",
                                    paddingBottom:3
                                }}>
                                {alreadyBookedTimeSlots.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "secondary.main",
                                                transition: "all 0.3s ease-in-out",
                                            }}

                                        >
                                            Empty List..!
                                        </Typography>
                                    </motion.div>
                                ) : (
                                    alreadyBookedTimeSlots.map((time, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariant}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <Typography
                                                display="flex"
                                                sx={{
                                                    fontFamily: "monospace",
                                                    transition: "all 0.3s ease-in-out",
                                                }}
                                                fontSize={25}
                                                marginBottom={1}
                                                gap={1}
                                            >
                                                <Typography
                                                    sx={{
                                                        color: "primary.main",
                                                        fontSize: "25px",
                                                        transition: "all 0.3s ease-in-out",
                                                    }}
                                                >
                                                    {index + 1}.
                                                </Typography>
                                                {time}
                                            </Typography>
                                        </motion.div>
                                    ))
                                )}
                                </Box>
                            </AnimatePresence>

                        </Box>

                    </Box>

                </List>
            </Box>
            <Typography variant="h3"  sx={{fontSize:{xs:"30px"}, color:"primary.main", textAlign:"center", marginBottom:"20px", marginTop:{lg:"440px", xl:"30px", md:"30px", sm:"30px", xs:"30px"}, fontWeight:"bold"}}> Make a Selection </Typography>

            <Box sx={{
                display: "flex",

                flexDirection:{ xs: "column", // Stack
                    sm: "column",
                    md:"column",
                    lg:"column",
                    xl:"row"
                },

                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                gap:4,
                height:{
                    xs: "100%",
                    sm: "100%",
                    md:"100%",
                    lg:"400px",
                    xl:"400px"
                },


            }}>
                <Box flex={1} sx={{
                    borderRadius:3,
                    display:"flex",
                    width:{
                        xs: "100%",
                        sm: "90%",
                        md:"80%",
                        lg:"75%",
                        xl:"70%"
                    },
                    paddingY:3,
                    height:"100%",
                    flexDirection:"column",
                    backgroundColor:"background.paper",
                    mx:"auto"
                }}>
                    <LocalizationProvider   dateAdapter={AdapterDayjs}>
                        <Typography variant="h5" sx={{color:"secondary.main"}} textAlign="center">Please Select an Available Date</Typography>
                        <DateCalendar disablePast
                                      slotProps={{
                                          day: {
                                              sx: {
                                                  fontSize: {
                                                      xs: '1.4rem',

                                                  },
                                                  width: {

                                                      xl: 37,
                                                  },
                                                  height: {

                                                      xl: 37,
                                                  },
                                              },
                                          },
                                      }}
                                      value={newDate}
                                      onChange={(newValue) => {
                                          setNewDate(newValue)
                                      }}
                                      dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
                                        shouldDisableDate={(d)=>{
                                            const iso = d.format("YYYY-MM-DD")
                                            return availableDatesByDoctor.includes(iso);
                                        }}
                        />

                    </LocalizationProvider>

                </Box>

                <Box flex={2} gap={5} sx={{
                    borderRadius:3,
                    display:"flex",
                    width:{
                        xs: "100%",
                        sm: "90%",
                        md:"80%",
                        lg:"75%",
                        xl:"70%"
                    },
                    paddingY:3,
                    height:"100%",
                    flexDirection:{
                        xs: "column",
                        sm: "column",
                        md:"row",
                        lg:"row",
                        xl:"row"
                    },
                    justifyContent:"space-around",
                    alignItems:{
                        xl:"flex-start",
                        lg:"flex-start",
                        md:"flex-start",
                        sm:"center",
                    },
                    backgroundColor:"background.paper",
                    mx:"auto",
                    padding:2
                }}>
                    <Box sx={{
                        display:"flex",
                        flexDirection:"column",
                        justifyContent:"flex-start",
                        gap:3,
                    }}>
                        <Typography variant="h5" sx={{color:"secondary.main"}}>Select Time for Selected Date</Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                                disablePast
                                label="Start time"
                                value={startTime}
                                onChange={(newValue) => setStartTime(newValue)}
                            />


                            <TimePicker
                                disablePast
                                label="End time"
                                value={endTime}
                                onChange={(newValue) => setEndTime(newValue)}
                            />
                        </LocalizationProvider>
                        <Button variant="contained"  onClick={handleTimeSlots}>save selection</Button>
                    </Box>
                    <Box  gap={3}
                         sx={{




                         }}>
                        <Typography marginBottom={1} variant="h5" sx={{color:"secondary.main"}} >Currently Available Date List</Typography>

                        <AnimatePresence mode="popLayout">
                            <Box sx={{
                                maxHeight: "300px",
                                overflowY: "auto", // allow vertical scrolling
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": {
                                    display: "none",
                                },
                                paddingBottom:0,
                            }}>
                            {availableDatesByDoctor.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Typography
                                        sx={{
                                            color: "primary.main",
                                            transition: "all 0.3s ease-in-out",
                                            padding:0
                                        }}

                                    >
                                        Empty List..!
                                    </Typography>
                                </motion.div>
                            ) : (
                                availableDatesByDoctor.map((date, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariant}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Typography
                                            display="flex"
                                            sx={{
                                                fontFamily: "monospace",
                                                transition: "all 0.3s ease-in-out",
                                            }}
                                            fontSize={25}
                                            marginBottom={1}
                                            gap={1}
                                        >
                                            <Typography
                                                sx={{
                                                    color: "primary.main",
                                                    fontSize: "25px",
                                                    transition: "all 0.3s ease-in-out",
                                                }}
                                            >
                                                {index + 1}.
                                            </Typography>
                                            {date}
                                        </Typography>
                                    </motion.div>
                                ))
                            )}
                            </Box>
                        </AnimatePresence>
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default Home;