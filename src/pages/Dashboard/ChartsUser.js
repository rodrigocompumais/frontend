import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Stack, TextField } from '@mui/material';
import { useTheme } from "@material-ui/core/styles";
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import './button.css';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.padding,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(2),
    }
}));

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

export const getOptions = (theme) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            display: false,
        },
        tooltip: {
            backgroundColor: theme.palette.type === 'dark' 
                ? 'rgba(0, 0, 0, 0.8)' 
                : 'rgba(255, 255, 255, 0.95)',
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: function(context) {
                    return `${context.parsed.y} atendimentos`;
                }
            }
        },
        datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            color: theme.palette.text.primary,
            font: {
                size: 12,
                weight: "600"
            },
            formatter: (value) => value > 0 ? value : '',
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
                color: theme.palette.type === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
                color: theme.palette.text.secondary,
                font: {
                    size: 11,
                }
            }
        },
        y: {
            grid: {
                color: theme.palette.type === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
                color: theme.palette.text.secondary,
                font: {
                    size: 11,
                },
                stepSize: 1,
            },
            beginAtZero: true,
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    }
});

export const ChatsUser = () => {
    const theme = useTheme();
    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [] });

    useEffect(() => {
        handleGetTicketsInformation();
    }, [initialDate, finalDate]);

    const dataCharts = {
        labels: ticketsData && ticketsData?.data.length > 0 && ticketsData?.data.map((item) => item.nome),
        datasets: [
            {
                label: 'Atendimentos',
                data: ticketsData?.data.length > 0 && ticketsData?.data.map((item) => item.quantidade),
                backgroundColor: (context) => {
                    const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, '#0EA5E9');
                    gradient.addColorStop(1, '#22C55E');
                    return gradient;
                },
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const handleGetTicketsInformation = async () => {
        try {
            const { data } = await api.get("/dashboard/ticketsUsers", {
            params: { initialDate: format(initialDate, "yyyy-MM-dd"), finalDate: format(finalDate, "yyyy-MM-dd") },
        });
            setTicketsData(data);
        } catch (error) {
            toast.error(i18n.t("dashboard.toasts.userChartError"));
        }
    }

    return (
        <>
            <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ mb: 3 }} >
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={initialDate}
                        onChange={(newValue) => { setInitialDate(newValue) }}
                        label={i18n.t("dashboard.charts.user.start")}
                        renderInput={(params) => <TextField {...params} sx={{ width: '180px' }} />}
                    />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={finalDate}
                        onChange={(newValue) => { setFinalDate(newValue) }}
                        label={i18n.t("dashboard.charts.user.end")}
                        renderInput={(params) => <TextField {...params} sx={{ width: '180px' }} />}
                    />
                </LocalizationProvider>

                <Button 
                    className="buttonHover" 
                    onClick={handleGetTicketsInformation} 
                    variant='contained'
                    sx={{ height: '56px', textTransform: 'none', fontWeight: 600 }}
                >
                    {i18n.t("dashboard.charts.user.filter")}
                </Button>
            </Stack>
            <div style={{ height: '300px', position: 'relative' }}>
                <Bar 
                    options={getOptions(theme)} 
                    data={dataCharts} 
                />
            </div>
        </>
    );
}