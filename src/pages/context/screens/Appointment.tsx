import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from "@mui/material/Box";
import axiosInstance from "../../../axios/axiosInstance.ts";
import {useEffect} from "react";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {  Card, CardContent } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import PhoneIcon from "@mui/icons-material/Phone"
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { motion } from "framer-motion";
import AlertHook from '../../../alert/Alert.ts'
import {Alert, Collapse} from "@mui/material";



const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: "easeOut"
        }
    }),
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface Column {
    id: 'patientName' | 'date' | 'time' | 'reason' | 'status';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center' | 'left';
    format?: (value: number) => string;
}
type Patient = {
    patientId: string,
    name: string,
    userId?: string,
    email:string,
    address:string,
    age:number,
    gender:string,
    phone:string,
}

const columns: readonly Column[] = [
    { id: 'patientName', label: 'Patient', minWidth: 150 },
    { id: 'date', label: 'Date', minWidth: 100, align:"center" },
    {
        id: 'time',
        label: 'Time',
        minWidth: 60,
        align: 'center',
    },
    {
        id: 'reason',
        label: 'Reason',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        align: 'right',
    },
];




export default function Appointment() {

    const {openAlert, showAlert, closeAlert, alertStatus } = AlertHook();

    const [docId, setDocId] = React.useState<string>("");
    const [bookingList, setBookingList] = React.useState<[]>([]);
    const [bookingCount, setBookingCount] = React.useState<number>(0);

    useEffect(() => {
        fetchMe()
    }, []);

    const fetchMe = async ()=>{
        await axiosInstance.get("http://localhost:9091/api/doctors/auth-doctor-details", {headers:{Authorization : `Bearer ${localStorage.getItem("access_token")}`}}).then(res=>{
            setDocId(res.data.data.doctorId)
            fetchMyApp(res.data.data.doctorId, page, rowsPerPage)
        }).catch(err=>{
            console.log(err)
        })
    }

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event:any, newPage: number) => {
        setPage(newPage);
        fetchMyApp(docId, newPage, rowsPerPage)
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchMyApp(docId, 0, newSize);
    };

    const fetchMyApp = async (docId:string, pageNum:number = page, size:number = rowsPerPage)=>{
        console.log(docId, page, size);
        await axiosInstance.get(`http://localhost:9093/api/bookings/find-by-doctor/${docId}`, {params:{page:pageNum, size:size}}).then(res=>{
            console.log(res)
            setBookingList(res.data.data.bookingList)
            setBookingCount(res.data.data.bookingCount)
        }).catch(()=>{
            showAlert("failed-fetch-apps")
        })
    }

    const [patientDetails, setPatientDetails] = React.useState<Patient | null>(null)
    const fetchPatientDetails = async (patientId:string)=>{
        await axiosInstance.get(`http://localhost:9092/api/patients/find-patient/${patientId}`).then(res=>{
            setPatientDetails(res.data.data);
            handleOpenPatientDetails(res.data.data);

        }).catch(err=>{
            if(err.response.data.message === "Patient not found"){
                showAlert("no-pat")
            } else {
                showAlert("failed-fetch-pat")
            }
            console.log(err.response.data.message);

            setPatientDetails(null)
        })
    }

    const [openPatientDetailModal, setOpenPatientDetailModal] = React.useState(false);

    const handleOpenPatientDetails = (data:Patient) => {

        if(!data){
            console.error("Patient details are not available.");
            return;
        }

        setPatientDetails(data);
        setOpenPatientDetailModal(true);
    };
    const handleClosePatientDetailModal = () => {
        setOpenPatientDetailModal(false);
        setPatientDetails(null);
    };

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
                                severity={alertStatus.includes("success") ? "success" : "error"}
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
                                {alertStatus === "failed-fetch-pat" && "Failed to load patient details. Please refresh the page and try again."}
                                {alertStatus === "no-pat" && "Something went wrong. This patient is not available"}
                                {alertStatus === "failed-fetch-apps" && "Failed to load your booked appointments. Please refresh the page and try again."}
                            </Alert>
                        </Collapse>
            {/*alert*/}

            {/*patient details dialog modal*/}

            <BootstrapDialog
                onClose={handleClosePatientDetailModal}
                aria-labelledby="customized-dialog-title"
                open={openPatientDetailModal}

            >
                <DialogTitle sx={{ m: 0, p: 2, color:"primary.main" }} id="customized-dialog-title">
                   Patient Info
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClosePatientDetailModal}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Box display="grid" sx={{gridTemplateColumns:"1fr 1fr"}} gap={2}>


                        <Card variant="outlined">
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <AccountBoxIcon sx={{ color: "#2196f3" }}  />
                                <Typography variant="body1">{patientDetails?.name}</Typography>
                            </CardContent>
                        </Card>
                        <Card  sx={{}}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, paddingX:2 }}>
                                <EmailIcon sx={{ color: "#8515a8" }}/>
                                <Typography variant="body1">{patientDetails?.email}</Typography>
                            </CardContent>
                        </Card>

                        <Card >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <HomeIcon sx={{ color: "#4caf50" }} />
                                <Typography variant="body1">{patientDetails?.address}</Typography>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <CakeIcon sx={{ color: "#ff9800" }} />
                                <Typography variant="body1">{patientDetails?.age} years</Typography>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <WcIcon sx={{ color: "#f06292" }} />
                                <Typography variant="body1">{patientDetails?.gender.toUpperCase()}</Typography>
                            </CardContent>
                        </Card>

                        <Card >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <PhoneIcon sx={{ color: "#2196f3" }} />
                                <Typography variant="body1">{patientDetails?.phone}</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClosePatientDetailModal}>
                        close
                    </Button>
                </DialogActions>
            </BootstrapDialog>

            {/*patient details dialog modal*/}
            <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor:"background.paper", padding:1}}>
                <TableContainer sx={{height:{
                        xl: 600,
                        lg: 600,
                        md: 650,
                        sm: 800,
                        xs: 900,
                    }, maxHeight:{
                        xl: 600,
                        lg: 600,
                        md: 650,
                        sm: 800,
                        xs: "100%",
                    },overflowY: 'auto',

                    // Hide scrollbar across all browsers
                    scrollbarWidth: 'none',        // Firefox
                    msOverflowStyle: 'none',       // IE 10+
                    '&::-webkit-scrollbar': {
                        display: 'none',
                        width:"0"// Chrome, Safari, Edge
                    },}}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell sx={{color:"primary.main"}}
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookingList.map((row, index) => (
                                <motion.tr
                                    key={index}
                                    custom={index}
                                    initial="hidden"
                                    animate="visible"
                                    variants={rowVariants}
                                    onClick={() => fetchPatientDetails(row.patientId)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {columns.map((column, colIndex) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={colIndex} align={column.align}>
                                                {value}
                                            </TableCell>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={bookingCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
