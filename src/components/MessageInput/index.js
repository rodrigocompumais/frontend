import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { useParams } from "react-router-dom";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { FormControlLabel, Switch, Dialog, DialogContent, Box, Typography } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import VisibilityIcon from "@material-ui/icons/Visibility";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles(theme => ({
	mainWrapper: {
		backgroundColor: theme.palette.bordabox, //DARK MODE PLW DESIGN//
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
	},

	newMessageBox: {
		background: "#eee",
		width: "100%",
		display: "flex",
		padding: "7px",
		alignItems: "center",
	},

	messageInputWrapper: {
		padding: 6,
		marginRight: 7,
		background: "#fff",
		display: "flex",
		borderRadius: 20,
		flex: 1,
	},

	messageInput: {
		paddingLeft: 10,
		flex: 1,
		border: "none",
	},

	sendMessageIcons: {
		color: "grey",
	},

	uploadInput: {
		display: "none",
	},

	viewMediaInputWrapper: {
		display: "flex",
		padding: "10px 13px",
		position: "relative",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#eee",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
	},

	emojiBox: {
		position: "absolute",
		bottom: 63,
		width: 40,
		borderTop: "1px solid #e8e8e8",
	},

	circleLoading: {
		color: green[500],
		opacity: "70%",
		position: "absolute",
		top: "20%",
		left: "50%",
		marginLeft: -12,
	},

	audioLoading: {
		color: green[500],
		opacity: "70%",
	},

	recorderWrapper: {
		display: "flex",
		alignItems: "center",
		alignContent: "middle",
	},

	cancelAudioIcon: {
		color: "red",
	},

	sendAudioIcon: {
		color: "green",
	},

	replyginMsgWrapper: {
		display: "flex",
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 8,
		paddingLeft: 73,
		paddingRight: 7,
	},

	replyginMsgContainer: {
		flex: 1,
		marginRight: 5,
		overflowY: "hidden",
		backgroundColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: "7.5px",
		display: "flex",
		position: "relative",
	},

	replyginMsgBody: {
		padding: 10,
		height: "auto",
		display: "block",
		whiteSpace: "pre-wrap",
		overflow: "hidden",
	},

	replyginContactMsgSideColor: {
		flex: "none",
		width: "4px",
		backgroundColor: "#35cd96",
	},

	replyginSelfMsgSideColor: {
		flex: "none",
		width: "4px",
		backgroundColor: "#6bcbef",
	},

	messageContactName: {
		display: "flex",
		color: "#6bcbef",
		fontWeight: 500,
	},
	previewModal: {
		"& .MuiDialog-paper": {
			maxWidth: "90vw",
			maxHeight: "90vh",
			backgroundColor: "rgba(0, 0, 0, 0.95)",
			borderRadius: theme.spacing(2),
		},
	},
	previewModalContent: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: theme.spacing(2),
		minHeight: "400px",
		maxHeight: "80vh",
	},
	previewImage: {
		maxWidth: "100%",
		maxHeight: "80vh",
		objectFit: "contain",
		borderRadius: theme.spacing(1),
	},
	previewNavButton: {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		color: "#FFFFFF",
		zIndex: 10,
		"&:hover": {
			backgroundColor: "rgba(255, 255, 255, 0.3)",
		},
		"&:disabled": {
			opacity: 0.3,
		},
	},
	previewNavButtonLeft: {
		left: theme.spacing(2),
	},
	previewNavButtonRight: {
		right: theme.spacing(2),
	},
	previewIndicators: {
		display: "flex",
		justifyContent: "center",
		gap: theme.spacing(1),
		padding: theme.spacing(2),
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	previewIndicator: {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		backgroundColor: "rgba(255, 255, 255, 0.4)",
		cursor: "pointer",
		transition: "all 0.3s",
		"&.active": {
			backgroundColor: "#FFFFFF",
			width: "24px",
			borderRadius: "4px",
		},
	},
	previewImageInfo: {
		position: "absolute",
		bottom: theme.spacing(2),
		left: theme.spacing(2),
		right: theme.spacing(2),
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		color: "#FFFFFF",
		padding: theme.spacing(1, 2),
		borderRadius: theme.spacing(1),
		textAlign: "center",
	},
	previewButton: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
		padding: theme.spacing(1, 2),
		borderRadius: theme.spacing(1),
		backgroundColor: theme.palette.primary.main,
		color: "#FFFFFF",
		cursor: "pointer",
		"&:hover": {
			backgroundColor: theme.palette.primary.dark,
		},
	},
}));

const MessageInput = ({ ticketStatus }) => {
	const classes = useStyles();
	const { ticketId } = useParams();

	const [medias, setMedias] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [showEmoji, setShowEmoji] = useState(false);
	const [loading, setLoading] = useState(false);
	const [recording, setRecording] = useState(false);
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const inputRef = useRef();
	const previewUrlsRef = useRef([]);
	const { setReplyingMessage, replyingMessage } = useContext(
		ReplyMessageContext
	);
	const { user } = useContext(AuthContext);

	const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

	useEffect(() => {
		inputRef.current.focus();
	}, [replyingMessage]);

	useEffect(() => {
		inputRef.current.focus();
		return () => {
			setInputMessage("");
			setShowEmoji(false);
			// Limpar preview URLs antes de limpar medias
			previewUrlsRef.current.forEach((url) => {
				if (url) {
					URL.revokeObjectURL(url);
				}
			});
			previewUrlsRef.current = [];
			setMedias([]);
			setReplyingMessage(null);
		};
	}, [ticketId, setReplyingMessage]);

	// Filtrar apenas imagens para o carrossel
	const imageMedias = medias.filter(media => media.preview);

	// Funções de navegação do carrossel
	const handlePrevImage = () => {
		setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageMedias.length - 1));
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev < imageMedias.length - 1 ? prev + 1 : 0));
	};

	const handleIndicatorClick = (index) => {
		setCurrentImageIndex(index);
	};

	// Navegação por teclado no modal de preview
	useEffect(() => {
		if (!previewModalOpen || imageMedias.length <= 1) return;

		const handleKeyDown = (e) => {
			if (e.key === 'ArrowLeft') {
				setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageMedias.length - 1));
			} else if (e.key === 'ArrowRight') {
				setCurrentImageIndex((prev) => (prev < imageMedias.length - 1 ? prev + 1 : 0));
			} else if (e.key === 'Escape') {
				setPreviewModalOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [previewModalOpen, imageMedias.length]);

	const handleChangeInput = e => {
		setInputMessage(e.target.value);
	};

	const handleAddEmoji = e => {
		let emoji = e.native;
		setInputMessage(prevState => prevState + emoji);
	};

	const handleChangeMedias = e => {
		if (!e.target.files) {
			return;
		}

		const selectedMedias = Array.from(e.target.files);
		// Criar preview URLs para imagens
		const mediasWithPreview = selectedMedias.map(media => {
			let preview = null;
			if (media.type.startsWith('image/')) {
				preview = URL.createObjectURL(media);
				previewUrlsRef.current.push(preview);
			}
			return Object.assign(media, { preview });
		});
		setMedias(mediasWithPreview);
	};

	const handleInputPaste = e => {
		if (e.clipboardData.files.length > 0) {
			e.preventDefault();
			const selectedMedias = Array.from(e.clipboardData.files);
			const mediasWithPreview = selectedMedias.map(media => {
				let preview = null;
				if (media.type.startsWith('image/')) {
					preview = URL.createObjectURL(media);
				}
				return Object.assign(media, { preview });
			});
			setMedias(mediasWithPreview);
			return;
		}

		if (e.clipboardData.items) {
			const items = Array.from(e.clipboardData.items);
			const files = [];
			items.forEach(item => {
				if (item.kind === 'file') {
					files.push(item.getAsFile());
				}
			});

			if (files.length > 0) {
				e.preventDefault();
				const mediasWithPreview = files.map(media => {
					let preview = null;
					if (media.type.startsWith('image/')) {
						preview = URL.createObjectURL(media);
					}
					return Object.assign(media, { preview });
				});
				setMedias(mediasWithPreview);
			}
		}
	};

	const onDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const onDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const selectedMedias = Array.from(e.dataTransfer.files);
			const mediasWithPreview = selectedMedias.map(media => {
				let preview = null;
				if (media.type.startsWith('image/')) {
					preview = URL.createObjectURL(media);
				}
				return Object.assign(media, { preview });
			});
			setMedias(mediasWithPreview);
		}
	};

	const handleUploadMedia = async e => {
		setLoading(true);
		e.preventDefault();

		const formData = new FormData();
		formData.append("fromMe", true);
		medias.forEach(media => {
			formData.append("medias", media);
			formData.append("body", media.name);
		});

		try {
			await api.post(`/messages/${ticketId}`, formData);
		} catch (err) {
			toastError(err);
		}

		// Limpar preview URLs para liberar memória
		previewUrlsRef.current.forEach((url) => {
			if (url) {
				URL.revokeObjectURL(url);
			}
		});
		previewUrlsRef.current = [];

		setLoading(false);
		setMedias([]);
	};

	const handleSendMessage = async () => {
		if (inputMessage.trim() === "") return;
		setLoading(true);

		const message = {
			read: 1,
			fromMe: true,
			mediaUrl: "",
			body: signMessage
				? `*${user?.name}:*\n${inputMessage.trim()}`
				: inputMessage.trim(),
			quotedMsg: replyingMessage,
		};
		try {
			await api.post(`/messages/${ticketId}`, message);
		} catch (err) {
			toastError(err);
		}

		setInputMessage("");
		setShowEmoji(false);
		setLoading(false);
		setReplyingMessage(null);
	};

	const handleStartRecording = async () => {
		setLoading(true);
		try {
			await navigator.mediaDevices.getUserMedia({ audio: true });
			await Mp3Recorder.start();
			setRecording(true);
			setLoading(false);
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	const handleUploadAudio = async () => {
		setLoading(true);
		try {
			const [, blob] = await Mp3Recorder.stop().getMp3();
			if (blob.size < 10000) {
				setLoading(false);
				setRecording(false);
				return;
			}

			const formData = new FormData();
			const filename = `${new Date().getTime()}.mp3`;
			formData.append("medias", blob, filename);
			formData.append("body", filename);
			formData.append("fromMe", true);

			await api.post(`/messages/${ticketId}`, formData);
		} catch (err) {
			toastError(err);
		}

		setRecording(false);
		setLoading(false);
	};

	const handleCancelAudio = async () => {
		try {
			await Mp3Recorder.stop().getMp3();
			setRecording(false);
		} catch (err) {
			toastError(err);
		}
	};

	const renderReplyingMessage = message => {
		return (
			<div className={classes.replyginMsgWrapper}>
				<div className={classes.replyginMsgContainer}>
					<span
						className={clsx(classes.replyginContactMsgSideColor, {
							[classes.replyginSelfMsgSideColor]: !message.fromMe,
						})}
					></span>
					<div className={classes.replyginMsgBody}>
						{!message.fromMe && (
							<span className={classes.messageContactName}>
								{message.contact?.name}
							</span>
						)}
						{message.body}
					</div>
				</div>
				<IconButton
					aria-label="showRecorder"
					component="span"
					disabled={loading || ticketStatus !== "open"}
					onClick={() => setReplyingMessage(null)}
				>
					<ClearIcon className={classes.sendMessageIcons} />
				</IconButton>
			</div>
		);
	};

	if (medias.length > 0)
		return (
			<>
				<Paper elevation={0} square className={classes.viewMediaInputWrapper}>
					<IconButton
						aria-label="cancel-upload"
						component="span"
						onClick={(e) => {
							// Limpar preview URLs antes de limpar medias
							previewUrlsRef.current.forEach((url) => {
								if (url) {
									URL.revokeObjectURL(url);
								}
							});
							previewUrlsRef.current = [];
							setMedias([]);
						}}
					>
						<CancelIcon className={classes.sendMessageIcons} />
					</IconButton>

					{loading ? (
						<div>
							<CircularProgress className={classes.circleLoading} />
						</div>
					) : (
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflowX: 'auto', padding: '4px' }}>
							{medias.map((media, index) => (
								<div
									key={index}
									style={{
										position: 'relative',
										cursor: 'pointer',
										borderRadius: 8,
										overflow: 'hidden',
										width: 60,
										height: 60,
										flexShrink: 0,
										border: '1px solid #ddd'
									}}
									onClick={() => {
										setCurrentImageIndex(index);
										setPreviewModalOpen(true);
									}}
								>
									{media.preview ? (
										<img
											src={media.preview}
											alt={media.name}
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
										/>
									) : (
										<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
											<AttachFileIcon style={{ fontSize: 24, color: '#666' }} />
										</div>
									)}
								</div>
							))}
							{medias.length > 0 && (
								<Typography variant="caption" style={{ marginLeft: 8 }}>
									{medias.length > 1 ? `+${medias.length - 1}` : ''}
								</Typography>
							)}
						</div>
					)}
					<IconButton
						aria-label="send-upload"
						component="span"
						onClick={handleUploadMedia}
						disabled={loading}
					>
						<SendIcon className={classes.sendMessageIcons} />
					</IconButton>
				</Paper>

				{/* Modal de Preview com Carrossel */}
				<Dialog
					open={previewModalOpen}
					onClose={() => setPreviewModalOpen(false)}
					className={classes.previewModal}
					maxWidth={false}
					fullWidth
				>
					<DialogContent className={classes.previewModalContent} style={{ padding: 0 }}>
						{imageMedias.length > 0 ? (
							<>
								{/* Imagem atual */}
								<img
									src={imageMedias[currentImageIndex]?.preview}
									alt={imageMedias[currentImageIndex]?.name || 'Preview'}
									className={classes.previewImage}
								/>

								{/* Botão anterior */}
								{imageMedias.length > 1 && (
									<IconButton
										className={`${classes.previewNavButton} ${classes.previewNavButtonLeft}`}
										onClick={handlePrevImage}
										aria-label="Imagem anterior"
									>
										<ChevronLeftIcon />
									</IconButton>
								)}

								{/* Botão próximo */}
								{imageMedias.length > 1 && (
									<IconButton
										className={`${classes.previewNavButton} ${classes.previewNavButtonRight}`}
										onClick={handleNextImage}
										aria-label="Próxima imagem"
									>
										<ChevronRightIcon />
									</IconButton>
								)}

								{/* Informações da imagem */}
								<Box className={classes.previewImageInfo}>
									<Typography variant="body2" style={{ fontWeight: 500 }}>
										{imageMedias[currentImageIndex]?.name || 'Imagem'}
									</Typography>
									{imageMedias.length > 1 && (
										<Typography variant="caption" style={{ opacity: 0.8 }}>
											{currentImageIndex + 1} de {imageMedias.length}
										</Typography>
									)}
								</Box>

								{/* Indicadores */}
								{imageMedias.length > 1 && (
									<Box className={classes.previewIndicators}>
										{imageMedias.map((_, index) => (
											<Box
												key={index}
												className={`${classes.previewIndicator} ${index === currentImageIndex ? 'active' : ''
													}`}
												onClick={() => handleIndicatorClick(index)}
											/>
										))}
									</Box>
								)}
							</>
						) : (
							<Box p={4} textAlign="center">
								<Typography variant="body1" color="textSecondary">
									Nenhuma imagem para visualizar
								</Typography>
							</Box>
						)}
					</DialogContent>
				</Dialog>
			</>
		);
	else {
		return (
			<Paper
				square
				elevation={0}
				className={classes.mainWrapper}
				onDragOver={onDragOver}
				onDrop={onDrop}
			>
				{replyingMessage && renderReplyingMessage(replyingMessage)}
				<div className={classes.newMessageBox}>
					<IconButton
						aria-label="emojiPicker"
						component="span"
						disabled={loading || recording || ticketStatus !== "open"}
						onClick={e => setShowEmoji(prevState => !prevState)}
					>
						<MoodIcon className={classes.sendMessageIcons} />
					</IconButton>
					{showEmoji ? (
						<div className={classes.emojiBox}>
							<Picker
								perLine={16}
								showPreview={false}
								showSkinTones={false}
								onSelect={handleAddEmoji}
							/>
						</div>
					) : null}

					<input
						multiple
						type="file"
						id="upload-button"
						disabled={loading || recording || ticketStatus !== "open"}
						className={classes.uploadInput}
						onChange={handleChangeMedias}
					/>
					<label htmlFor="upload-button">
						<IconButton
							aria-label="upload"
							component="span"
							disabled={loading || recording || ticketStatus !== "open"}
						>
							<AttachFileIcon className={classes.sendMessageIcons} />
						</IconButton>
					</label>
					<FormControlLabel
						style={{ marginRight: 7, color: "gray" }}
						label={i18n.t("messagesInput.signMessage")}
						labelPlacement="start"
						control={
							<Switch
								size="small"
								checked={signMessage}
								onChange={e => {
									setSignMessage(e.target.checked);
								}}
								name="showAllTickets"
								color="primary"
							/>
						}
					/>
					<div className={classes.messageInputWrapper}>
						<InputBase
							inputRef={input => {
								input && input.focus();
								input && (inputRef.current = input);
							}}
							className={classes.messageInput}
							placeholder={
								ticketStatus === "open"
									? i18n.t("messagesInput.placeholderOpen")
									: i18n.t("messagesInput.placeholderClosed")
							}
							multiline
							maxRows={5}
							value={inputMessage}
							onChange={handleChangeInput}
							disabled={recording || loading || ticketStatus !== "open"}
							onPaste={e => {
								ticketStatus === "open" && handleInputPaste(e);
							}}
							onKeyPress={e => {
								if (loading || e.shiftKey) return;
								else if (e.key === "Enter") {
									handleSendMessage();
								}
							}}
						/>
					</div>
					{inputMessage ? (
						<IconButton
							aria-label="sendMessage"
							component="span"
							onClick={handleSendMessage}
							disabled={loading}
						>
							<SendIcon className={classes.sendMessageIcons} />
						</IconButton>
					) : recording ? (
						<div className={classes.recorderWrapper}>
							<IconButton
								aria-label="cancelRecording"
								component="span"
								fontSize="large"
								disabled={loading}
								onClick={handleCancelAudio}
							>
								<HighlightOffIcon className={classes.cancelAudioIcon} />
							</IconButton>
							{loading ? (
								<div>
									<CircularProgress className={classes.audioLoading} />
								</div>
							) : (
								<RecordingTimer />
							)}

							<IconButton
								aria-label="sendRecordedAudio"
								component="span"
								onClick={handleUploadAudio}
								disabled={loading}
							>
								<CheckCircleOutlineIcon className={classes.sendAudioIcon} />
							</IconButton>
						</div>
					) : (
						<IconButton
							aria-label="showRecorder"
							component="span"
							disabled={loading || ticketStatus !== "open"}
							onClick={handleStartRecording}
						>
							<MicIcon className={classes.sendMessageIcons} />
						</IconButton>
					)}
				</div>
			</Paper>
		);
	}
};

export default MessageInput;