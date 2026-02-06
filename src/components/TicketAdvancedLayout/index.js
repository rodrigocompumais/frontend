import { styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const TicketAdvancedLayout = styled(Paper)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    padding: 0,
    minHeight: 0,
    height: "calc(100vh - 56px)",
    maxHeight: "calc(100vh - 56px)",
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: theme.palette.background.default,
    boxShadow: "none",
    width: "100%",
    [theme.breakpoints.down('sm')]: {
        padding: 0,
        height: "calc(100vh - 56px)",
        maxHeight: "calc(100vh - 56px)",
        position: "relative",
        zIndex: 0,
    },
}))

export default TicketAdvancedLayout;