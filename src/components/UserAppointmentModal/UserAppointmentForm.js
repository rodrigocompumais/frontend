import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FormControl from "@material-ui/core/FormControl";
import moment from "moment";
import { isArray } from "lodash";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

const AppointmentSchema = Yup.object().shape({
    title: Yup.string().min(3, "Título muito curto").required("Obrigatório"),
    description: Yup.string(),
    startTime: Yup.date().required("Obrigatório"),
    endTime: Yup.date().required("Obrigatório"),
    assignedUserId: Yup.number(),
    reminderMinutes: Yup.number(),
});

const UserAppointmentForm = ({ appointmentId, onClose, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);

    const initialState = {
        title: "",
        description: "",
        startTime: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
        endTime: moment().add(2, "hours").format("YYYY-MM-DDTHH:mm"),
        assignedUserId: "",
        reminderMinutes: 15,
    };

    const initialUser = {
        id: "",
        name: "",
    };

    const [appointment, setAppointment] = useState(initialState);
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [users, setUsers] = useState([initialUser]);

    useEffect(() => {
        const { companyId } = user;
        if (appointmentId) {
            (async () => {
                try {
                    const { data } = await api.get(`/user-appointments/${appointmentId}`);
                    setAppointment({
                        ...data,
                        startTime: moment(data.startTime).format("YYYY-MM-DDTHH:mm"),
                        endTime: moment(data.endTime).format("YYYY-MM-DDTHH:mm"),
                    });
                    if (data.assignedUser) {
                        setCurrentUser(data.assignedUser);
                    }
                } catch (err) {
                    toastError(err);
                }
            })();
        }

        // Fetch users list
        (async () => {
            try {
                const { data: usersList } = await api.get("/users/", {
                    params: { companyId },
                });
                let customList = usersList.users.map((u) => ({ id: u.id, name: u.name }));
                if (isArray(customList)) {
                    setUsers([{ id: "", name: "" }, ...customList]);
                }
            } catch (err) {
                toastError(err);
            }
        })();
    }, [appointmentId, user]);

    const handleSaveAppointment = async (values) => {
        try {
            if (appointmentId) {
                await api.put(`/user-appointments/${appointmentId}`, values);
                toast.success(i18n.t("userAppointmentModal.success"));
            } else {
                await api.post("/user-appointments", values);
                toast.success(i18n.t("userAppointmentModal.success"));
            }
            if (typeof reload === "function") {
                reload();
            }
            onClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <div className={classes.root}>
            <Formik
                initialValues={appointment}
                enableReinitialize={true}
                validationSchema={AppointmentSchema}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        handleSaveAppointment(values);
                        actions.setSubmitting(false);
                    }, 400);
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <FormControl variant="outlined" fullWidth>
                                <Field
                                    as={TextField}
                                    label={i18n.t("userAppointmentModal.form.title")}
                                    name="title"
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                            </FormControl>
                            <br />
                            <FormControl variant="outlined" fullWidth>
                                <Field
                                    as={TextField}
                                    label={i18n.t("userAppointmentModal.form.description")}
                                    name="description"
                                    multiline
                                    rows={3}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                            </FormControl>
                            <br />
                            <FormControl variant="outlined" fullWidth>
                                <Field
                                    as={TextField}
                                    label={i18n.t("userAppointmentModal.form.startTime")}
                                    type="datetime-local"
                                    name="startTime"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={touched.startTime && Boolean(errors.startTime)}
                                    helperText={touched.startTime && errors.startTime}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                            </FormControl>
                            <br />
                            <FormControl variant="outlined" fullWidth>
                                <Field
                                    as={TextField}
                                    label={i18n.t("userAppointmentModal.form.endTime")}
                                    type="datetime-local"
                                    name="endTime"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={touched.endTime && Boolean(errors.endTime)}
                                    helperText={touched.endTime && errors.endTime}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                            </FormControl>
                            <br />
                            <FormControl variant="outlined" fullWidth>
                                <Autocomplete
                                    fullWidth
                                    value={currentUser}
                                    options={users}
                                    onChange={(e, selectedUser) => {
                                        const userId = selectedUser ? selectedUser.id : "";
                                        setFieldValue("assignedUserId", userId);
                                        setCurrentUser(selectedUser || initialUser);
                                    }}
                                    getOptionLabel={(option) => option.name}
                                    getOptionSelected={(option, value) => value.id === option.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            placeholder={i18n.t("userAppointmentModal.form.assignedTo")}
                                        />
                                    )}
                                />
                            </FormControl>
                            <br />
                            <FormControl variant="outlined" fullWidth>
                                <Field
                                    as={TextField}
                                    select
                                    label={i18n.t("userAppointmentModal.form.reminderMinutes")}
                                    name="reminderMinutes"
                                    variant="outlined"
                                    margin="dense"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    fullWidth
                                >
                                    <option value={5}>5 minutos</option>
                                    <option value={10}>10 minutos</option>
                                    <option value={15}>15 minutos</option>
                                    <option value={30}>30 minutos</option>
                                    <option value={60}>1 hora</option>
                                </Field>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} color="secondary" disabled={isSubmitting} variant="outlined">
                                {i18n.t("userAppointmentModal.buttons.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                disabled={isSubmitting}
                                variant="contained"
                                className={classes.btnWrapper}
                            >
                                {appointmentId
                                    ? i18n.t("userAppointmentModal.buttons.okEdit")
                                    : i18n.t("userAppointmentModal.buttons.okAdd")}
                                {isSubmitting && (
                                    <CircularProgress size={24} className={classes.buttonProgress} />
                                )}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UserAppointmentForm;
