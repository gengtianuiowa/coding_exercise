import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {CircularProgress, List, ListItem, ListItemText, Snackbar} from "@mui/material";
import {fetchLikedFormSubmissions, onMessage, saveLikedFormSubmission} from "./service/mockServer";
import {Button as AntdButton} from 'antd'
import {message} from "antd";
import {RedoOutlined} from "@ant-design/icons";

export default function Content() {
    const [likedSubmissions, setLikedSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [formSubmission, setFormSubmission] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const reloadSubmissions = () => {
        return fetchLikedFormSubmissions()
            .then(response => {
                setLikedSubmissions(response.formSubmissions);
                setLoading(false);
            })
            .catch(error => {
                message.error("Submissions loading failed! Please click the refresh button to load the page again.")
                setLoading(false);
            });
    }
    useEffect(() => {
        onMessage((formSubmission) => {
            setFormSubmission(formSubmission);
            if (formSubmission) {
                setSnackbarOpen(true);
            }
        });
        reloadSubmissions();
    }, []);
    return (
        <Box sx={{marginTop: 3}}>
            <Typography variant="h4">Liked Form Submissions</Typography>
            <AntdButton loading={refreshLoading} onClick={async () => {
                setRefreshLoading(true);
                reloadSubmissions().then(res => {
                    message.success("Refresh is done.");
                    setRefreshLoading(false);
                })
            }} icon={<RedoOutlined/>}>Refresh</AntdButton>
            <Typography variant="body1" sx={{fontStyle: 'italic', marginTop: 1}}>
            </Typography>
            {loading && <CircularProgress/>}
            <List>
                {likedSubmissions.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`${item.data.firstName} ${item.data.lastName}`}
                            secondary={`Email: ${item.data.email} submitted the form, and we liked it.`}
                        />
                    </ListItem>
                ))}
            </List>
            {formSubmission && <Snackbar
                open={snackbarOpen}
                message={`Name: ${formSubmission.data.firstName} ${formSubmission.data.lastName}, email :${formSubmission.data.email}`}
                action={
                    <>
                        <AntdButton color="primary" size="small" loading={buttonLoading}
                                    onClick={async () => {
                                        setButtonLoading(true);
                                        try {
                                            let res = await saveLikedFormSubmission(formSubmission);
                                            let {status} = res;
                                            if (status !== 202) {
                                                message.error("Like submission failed! Please try again.");
                                                console.log(res.message);
                                                return;
                                            }
                                            await reloadSubmissions();
                                            message.success(`The user ${formSubmission.data.firstName} ${formSubmission.data.lastName} was liked successfully! You can find him/her at the bottom of the list.`);
                                            setSnackbarOpen(false);
                                        } catch (err) {
                                            message.error("Like submission failed! Please try again.");
                                            console.log(err);
                                        }
                                        setButtonLoading(false);
                                    }}>
                            Like
                        </AntdButton>
                        <AntdButton color="primary" size="small" onClick={() => setSnackbarOpen(false)}>
                            Dismiss
                        </AntdButton>
                    </>
                }
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            />}
        </Box>
    );
}
