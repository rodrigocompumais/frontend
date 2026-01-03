import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  useRef,
} from "react";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import RemoveEdge from "./nodes/removeEdge";
import singleBlockNode from "./nodes/singleBlockNode";
import ticketNode from "./nodes/ticketNode";

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  Stack,
  Typography,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Box,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import BallotIcon from "@mui/icons-material/Ballot";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";

import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";

import FlowBuilderToolbar from "../../components/FlowBuilder/FlowBuilderToolbar";
import FlowBuilderSidebar from "../../components/FlowBuilder/FlowBuilderSidebar";


import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam,
} from "@mui/icons-material";

import { useNodeStorage } from "../../stores/useNodeStorage";
import { ConfirmationNumber } from "@material-ui/icons";

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette?.mode === "dark" || theme.palette?.type === "dark";
  return {
    mainPaper: {
      flex: 1,
      padding: 0,
      position: "relative",
      backgroundColor: isDark
        ? theme.palette.background?.default || "#121212"
        : "#F8F9FA",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "calc(100vh - 64px)",
    },
    speeddial: {
      backgroundColor: "red",
    },
  };
});

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
};

const edgeTypes = {
  buttonedge: RemoveEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
  },
];

const initialEdges = [];

// Componente interno que usa useReactFlow dentro do provider
const FlowBuilderContent = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  doubleClick,
  clickNode,
  clickEdge,
  nodeTypes,
  edgeTypes,
  sidebarOpen,
  setSidebarOpen,
  dataNode,
  updateNode,
  clickActions,
  actions,
  saveFlow,
  isTestMode,
  onTest,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onExport,
  onImport,
  canUndo,
  canRedo,
  reactFlowInstanceRef,
}) => {
  const reactFlowInstance = useReactFlow();
  const theme = useTheme();

  // Expor instância para o componente pai
  React.useEffect(() => {
    if (reactFlowInstanceRef) {
      reactFlowInstanceRef.current = reactFlowInstance;
    }
  }, [reactFlowInstance, reactFlowInstanceRef]);

  return (
    <>
      {/* Toolbar Principal */}
      <FlowBuilderToolbar
        onSave={saveFlow}
        onUndo={onUndo}
        onRedo={onRedo}
        onZoomIn={() => reactFlowInstance?.zoomIn()}
        onZoomOut={() => reactFlowInstance?.zoomOut()}
        onFitView={() => reactFlowInstance?.fitView()}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onExport={onExport}
        onImport={onImport}
        onTest={onTest}
        canUndo={canUndo}
        canRedo={canRedo}
        isTestMode={isTestMode}
      />

      <Stack
        direction={"row"}
        sx={{
          width: "100%",
          height: "calc(100vh - 200px)",
          position: "relative",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Barra lateral esquerda fixa para adicionar componentes */}
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              backgroundColor: (theme) => theme.palette.background.paper,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              position: "relative",
              height: "100%",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: (theme) =>
                  (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: (theme) =>
                    (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(0, 0, 0, 0.3)",
                },
              },
            },
          }}
        >
          <Box
            sx={{
              padding: 2,
              backgroundColor: (theme) =>
                (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                  ? (theme?.palette?.background?.default || "#121212")
                  : "#F5F5F5",
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: (theme) => theme.palette.text.secondary,
              }}
            >
              Adicionar Componentes
            </Typography>
          </Box>
          <List sx={{ padding: 1 }}>
            {actions.map((action) => (
              <Tooltip key={action.name} title={action.name} placement="right">
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      clickActions(action.type);
                    }}
                    sx={{
                      borderRadius: 2,
                      padding: 1.5,
                      "&:hover": {
                        backgroundColor: (theme) =>
                          (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.04)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: (theme) => {
                          const colors = {
                            start: "#3ABA38",
                            content: "#EC5858",
                            menu: "#683AC8",
                            random: "#1FBADC",
                            interval: "#F7953B",
                            ticket: "#F7953B",
                            typebot: "#3aba38",
                            openai: "#F7953B",
                            question: "#F7953B",
                          };
                          return colors[action.type] || theme?.palette?.primary?.main || "#1976d2";
                        },
                      }}
                    >
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.name}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Drawer>
        <Box
          sx={{
            flex: 1,
            position: "relative",
            backgroundColor: (theme) =>
              (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                ? (theme?.palette?.background?.default || "#121212")
                : "#F8F9FA",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDoubleClick={doubleClick}
            onNodeClick={clickNode}
            onEdgeClick={clickEdge}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            connectionLineStyle={{
              stroke: theme?.palette?.primary?.main || "#1976d2",
              strokeWidth: 2,
              strokeDasharray: "5,5",
            }}
            style={{
              backgroundColor: "transparent",
              width: "100%",
              height: "100%",
            }}
            edgeTypes={edgeTypes}
            variant={"cross"}
            defaultEdgeOptions={{
              style: {
                stroke: theme?.palette?.primary?.main || "#1976d2",
                strokeWidth: 2,
              },
              animated: true,
              type: "smoothstep",
            }}
          >
            <Controls
              style={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <MiniMap
              style={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
              }}
              nodeColor={(node) => {
                const colors = {
                  start: "#3ABA38",
                  message: "#6865A5",
                  menu: "#683AC8",
                  interval: "#F7953B",
                  img: "#6865A5",
                  audio: "#6865A5",
                  video: "#6865A5",
                  randomizer: "#1FBADC",
                  singleBlock: "#EC5858",
                  ticket: "#F7953B",
                  typebot: "#3aba38",
                  openai: "#F7953B",
                  question: "#F7953B",
                };
                return colors[node.type] || "#666";
              }}
            />
            <Background
              variant="dots"
              gap={16}
              size={1}
              color={(theme?.palette?.mode === "dark" || theme?.palette?.type === "dark")
                ? (theme?.palette?.divider || "#424242")
                : "#e0e0e0"}
            />
          </ReactFlow>
        </Box>

        {/* Sidebar para propriedades */}
        <FlowBuilderSidebar
          open={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
            // Ajustar visualização quando sidebar fecha
            setTimeout(() => {
              if (reactFlowInstanceRef.current) {
                reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 300 });
              }
            }, 300);
          }}
          selectedNode={dataNode}
          onUpdateNode={updateNode}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </Stack>
    </>
  );
};

const FlowBuilderConfig = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentTestNodeId, setCurrentTestNodeId] = useState(null);
  const testTimeoutRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const isTestModeRef = useRef(false);

  // Histórico para Undo/Redo
  const [flowHistory, setFlowHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);


  // Inicializar histórico com estado inicial
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setFlowHistory([{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
      setHistoryIndex(0);
    }
  }, []); // Apenas na montagem inicial

  const addNode = (type, data) => {

    const posY = nodes[nodes.length - 1].position.y;
    const posX = nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    if (type === "start") {
      return setNodes((old) => {
        return [
          ...old.filter((item) => item.id !== "1"),
          {
            id: "1",
            position: { x: posX, y: posY },
            data: { label: "Inicio do fluxo" },
            type: "start",
          },
        ];
      });
    }
    if (type === "text") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message",
          },
        ];
      });
    }
    if (type === "interval") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval",
          },
        ];
      });
    }
    if (type === "condition") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value,
            },
            type: "condition",
          },
        ];
      });
    }
    if (type === "menu") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption,
            },
            type: "menu",
          },
        ];
      });
    }
    if (type === "img") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img",
          },
        ];
      });
    }
    if (type === "audio") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio",
          },
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer",
          },
        ];
      });
    }
    if (type === "video") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video",
          },
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock",
          },
        ];
      });
    }

    if (type === "ticket") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket",
          },
        ];
      });
    }

    if (type === "typebot") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "typebot",
          },
        ];
      });
    }

    if (type === "openai") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "openai",
          },
        ];
      });
    }

    if (type === "question") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "question",
          },
        ];
      });
    }
  };

  const textAdd = (data) => {
    addNode("text", data);
  };

  const intervalAdd = (data) => {
    addNode("interval", data);
  };

  const conditionAdd = (data) => {
    addNode("condition", data);
  };

  const menuAdd = (data) => {
    addNode("menu", data);
  };

  const imgAdd = (data) => {
    addNode("img", data);
  };

  const audioAdd = (data) => {
    addNode("audio", data);
  };

  const randomizerAdd = (data) => {
    addNode("randomizer", data);
  };

  const videoAdd = (data) => {
    addNode("video", data);
  };

  const singleBlockAdd = (data) => {
    addNode("singleBlock", data);
  };

  const ticketAdd = (data) => {
    addNode("ticket", data);
  };

  const typebotAdd = (data) => {
    addNode("typebot", data);
  };

  const openaiAdd = (data) => {
    addNode("openai", data);
  };

  const questionAdd = (data) => {
    addNode("question", data);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Função para salvar estado no histórico
  const saveToHistory = useCallback(() => {
    setFlowHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
      // Limitar histórico a 50 estados
      const finalHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
      setHistoryIndex(finalHistory.length - 1);
      return finalHistory;
    });
  }, [nodes, edges, historyIndex]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        // Salvar no histórico após o estado atualizar
        setTimeout(() => {
          setFlowHistory((prev) => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({
              nodes: JSON.parse(JSON.stringify(nodes)),
              edges: JSON.parse(JSON.stringify(newEdges))
            });
            const finalHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
            setHistoryIndex(finalHistory.length - 1);
            return finalHistory;
          });
        }, 0);
        return newEdges;
      });
    },
    [setEdges, nodes, historyIndex]
  );

  // Função para desfazer (Undo)
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = flowHistory[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [flowHistory, historyIndex, setNodes, setEdges]);

  // Função para refazer (Redo)
  const handleRedo = useCallback(() => {
    if (historyIndex < flowHistory.length - 1) {
      const nextState = flowHistory[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [flowHistory, historyIndex, setNodes, setEdges]);

  // Função para duplicar nó selecionado
  const handleDuplicateNode = useCallback(() => {
    if (!dataNode) {
      toast.warning("Selecione um nó para duplicar");
      return;
    }

    const nodeDuplicate = nodes.find((item) => item.id === dataNode.id);
    if (!nodeDuplicate) return;

    const maioresX = nodes.map((node) => node.position.x);
    const maiorX = Math.max(...maioresX);
    const finalY = nodes[nodes.length - 1].position.y;

    const nodeNew = {
      ...nodeDuplicate,
      id: geraStringAleatoria(30),
      position: {
        x: maiorX + 240,
        y: finalY,
      },
      selected: false,
      style: { backgroundColor: (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark") ? (theme?.palette?.background?.paper || "#1e1e1e") : "#FFFFFF", padding: 0, borderRadius: 8 },
    };

    setNodes((old) => [...old, nodeNew]);
    saveToHistory();
    toast.success("Nó duplicado com sucesso");
  }, [dataNode, nodes, setNodes, saveToHistory]);

  // Função para excluir nó selecionado
  const handleDeleteNode = useCallback(() => {
    if (!dataNode) {
      toast.warning("Selecione um nó para excluir");
      return;
    }

    if (dataNode.type === "start") {
      toast.error("Não é possível excluir o nó de início");
      return;
    }

    setNodes((old) => old.filter((item) => item.id !== dataNode.id));
    setEdges((old) => {
      const newData = old.filter((item) => item.source !== dataNode.id);
      return newData.filter((item) => item.target !== dataNode.id);
    });
    setDataNode(null);
    setSidebarOpen(false);
    saveToHistory();
    toast.success("Nó excluído com sucesso");
  }, [dataNode, setNodes, setEdges, saveToHistory]);

  // Função para exportar fluxo
  const handleExportFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      version: "1.0",
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `automacao-${id || "novo"}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Automação exportada com sucesso");
  }, [nodes, edges, id]);

  // Função para importar fluxo
  const handleImportFlow = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const flowData = JSON.parse(event.target.result);
          if (flowData.nodes && flowData.edges) {
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
            saveToHistory();
            toast.success("Automação importada com sucesso");
          } else {
            toast.error("Arquivo inválido: formato não reconhecido");
          }
        } catch (error) {
          toast.error("Erro ao importar automação: arquivo inválido");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, saveToHistory]);

  const [flowName, setFlowName] = useState("");

  const saveFlow = async () => {
    try {
      // Salvar o fluxo
      const flowResponse = await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      });

      // Obter o ID do fluxo (pode ser retornado na resposta ou usar o id existente)
      const flowId = flowResponse?.data?.flow?.id || flowResponse?.data?.id || id;

      // Buscar informações do fluxo para obter o nome
      let flowData = null;
      if (flowId) {
        try {
          const flowInfo = await api.get(`/flowbuilder/flow/${flowId}`);
          flowData = flowInfo.data.flow;
        } catch (err) {
          // Se não conseguir buscar, continua com o nome padrão
          console.warn("Não foi possível buscar informações do fluxo:", err);
        }
      }

      const flowNameToUse = flowData?.name || flowName || `Automação ${flowId || "Nova"}`;

      // Verificar se já existe integração para este fluxo
      let integrationExists = false;
      let existingIntegrationId = null;

      try {
        const integrations = await api.get("/queueIntegration");
        // Buscar por nome ou por projectName
        const existingIntegration = integrations.data.find(
          (int) => int.type === "flowbuilder" &&
            (int.projectName === flowNameToUse || int.name === flowNameToUse)
        );
        if (existingIntegration) {
          integrationExists = true;
          existingIntegrationId = existingIntegration.id;
        }
      } catch (err) {
        // Se não conseguir buscar, continua criando nova
        console.warn("Não foi possível buscar integrações existentes:", err);
      }

      // Criar ou atualizar integração automaticamente
      if (integrationExists && existingIntegrationId) {
        // Atualizar integração existente
        await api.put(`/queueIntegration/${existingIntegrationId}`, {
          type: "flowbuilder",
          name: flowNameToUse,
          projectName: flowNameToUse,
        });
        toast.success("Automação e integração atualizados com sucesso");
      } else {
        // Criar nova integração
        await api.post("/queueIntegration", {
          type: "flowbuilder",
          name: flowNameToUse,
          projectName: flowNameToUse,
        });
        toast.success("Automação salva e integração criada automaticamente");
      }
    } catch (err) {
      toastError(err);
      console.error("Erro ao salvar automação:", err);
    }
  };

  // Função para parar o teste
  const handleStopTest = useCallback(() => {
    if (testTimeoutRef.current) {
      clearTimeout(testTimeoutRef.current);
      testTimeoutRef.current = null;
    }
    isTestModeRef.current = false;
    setIsTestMode(false);
    setCurrentTestNodeId(null);
    // Restaurar estilos dos nós
    setNodes((old) =>
      old.map((node) => ({
        ...node,
        style: { ...node.style, border: "none", boxShadow: "none", opacity: 1 },
      }))
    );
  }, [setNodes]);

  // Função para iniciar o teste do fluxo
  const handleStartTest = useCallback(() => {
    if (isTestModeRef.current) {
      // Parar teste
      handleStopTest();
      return;
    }

    // Validar se há nó inicial
    const startNode = nodes.find((node) => node.type === "start");
    if (!startNode) {
      toast.error("Adicione um nó de início à automação antes de testar");
      return;
    }

    // Validar se há conexões
    if (edges.length === 0) {
      toast.warning("Adicione conexões entre os nós para testar o fluxo");
      return;
    }

    // Ativar modo de teste
    isTestModeRef.current = true;
    setIsTestMode(true);
    setCurrentTestNodeId(startNode.id);

    // Centralizar no nó inicial
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({
        padding: 0.3,
        duration: 500,
        nodes: [startNode]
      });
    }

    // Destacar nó inicial
    setNodes((old) =>
      old.map((node) => {
        if (node.id === startNode.id) {
          return {
            ...node,
            style: {
              ...node.style,
              border: "3px solid #4caf50",
              boxShadow: "0 0 20px rgba(76, 175, 80, 0.5)",
            },
          };
        }
        return {
          ...node,
          style: { ...node.style, border: "none", boxShadow: "none", opacity: 0.5 },
        };
      })
    );

    toast.info("Teste iniciado. Acompanhe a execução do fluxo...");

    // Capturar referências atuais para usar no closure
    const currentNodes = [...nodes];
    const currentEdges = [...edges];

    // Simular execução do fluxo
    let currentNodeId = startNode.id;
    let step = 0;
    const maxSteps = 50; // Limite de segurança
    const visitedNodes = new Set([startNode.id]);

    const executeStep = () => {
      // Verificar se o teste ainda está ativo usando ref
      if (!isTestModeRef.current) {
        console.log("Teste parado pelo usuário");
        return;
      }

      if (step >= maxSteps) {
        handleStopTest();
        toast.warning("Teste interrompido: limite de passos atingido");
        return;
      }

      // Buscar nó atual usando setNodes para garantir estado atualizado
      setNodes((currentNodesState) => {
        const currentNode = currentNodesState.find((n) => n.id === currentNodeId);
        if (!currentNode) {
          handleStopTest();
          toast.error("Nó não encontrado durante o teste");
          return currentNodesState;
        }

        // Mostrar informações do nó atual
        const nodeTypeLabels = {
          start: "Início",
          message: "Mensagem",
          menu: "Menu",
          interval: "Intervalo",
          img: "Imagem",
          audio: "Áudio",
          video: "Vídeo",
          randomizer: "Randomizador",
          singleBlock: "Conteúdo",
          ticket: "Ticket",
          typebot: "TypeBot",
          openai: "OpenAI",
          question: "Pergunta",
        };

        const nodeLabel = nodeTypeLabels[currentNode.type] || currentNode.type;
        const nodeName = currentNode.data?.label || currentNode.data?.message || nodeLabel;
        toast.info(`Executando: ${nodeName}`, { autoClose: 1500 });

        // Encontrar próxima conexão usando edges atualizados
        setEdges((currentEdgesState) => {
          const nextEdges = currentEdgesState.filter((edge) => edge.source === currentNodeId);

          if (nextEdges.length === 0) {
            // Fim do fluxo
            testTimeoutRef.current = setTimeout(() => {
              handleStopTest();
              toast.success(`Teste concluído! ${visitedNodes.size} nós executados.`);
            }, 1000);
            return currentEdgesState;
          }

          // Pegar primeira conexão
          const nextEdge = nextEdges[0];
          const nextNodeId = nextEdge.target;

          // Verificar se já visitou este nó (loop detection)
          if (visitedNodes.has(nextNodeId) && visitedNodes.size > 1) {
            toast.warning("Loop detectado no fluxo. Teste interrompido.");
            handleStopTest();
            return currentEdgesState;
          }

          visitedNodes.add(nextNodeId);
          setCurrentTestNodeId(nextNodeId);

          // Buscar próximo nó
          const nextNode = currentNodesState.find((n) => n.id === nextNodeId);

          // Centralizar no próximo nó
          if (nextNode && reactFlowInstanceRef.current) {
            reactFlowInstanceRef.current.fitView({
              padding: 0.3,
              duration: 500,
              nodes: [nextNode]
            });
          }

          // Atualizar estilos dos nós
          const updatedNodes = currentNodesState.map((node) => {
            if (node.id === currentNodeId) {
              return {
                ...node,
                style: {
                  ...node.style,
                  border: "2px solid #9e9e9e",
                  boxShadow: "none",
                  opacity: 0.7,
                },
              };
            }
            if (node.id === nextNodeId) {
              return {
                ...node,
                style: {
                  ...node.style,
                  border: "3px solid #4caf50",
                  boxShadow: "0 0 20px rgba(76, 175, 80, 0.5)",
                  opacity: 1,
                },
              };
            }
            return {
              ...node,
              style: { ...node.style, opacity: 0.5 },
            };
          });

          // Atualizar nodes
          setNodes(updatedNodes);

          // Atualizar variáveis para próximo passo
          currentNodeId = nextNodeId;
          step++;

          // Aguardar antes do próximo passo (simular delay)
          const delay = currentNode.type === "interval"
            ? (currentNode.data?.sec || 1) * 1000
            : currentNode.type === "message" || currentNode.type === "menu"
              ? 2000
              : 1500;

          testTimeoutRef.current = setTimeout(executeStep, delay);

          return currentEdgesState;
        });

        return currentNodesState;
      });
    };

    // Iniciar execução após um pequeno delay
    testTimeoutRef.current = setTimeout(executeStep, 800);
  }, [nodes, edges, handleStopTest, setNodes, setEdges, reactFlowInstanceRef]);

  const doubleClick = (event, node) => {
    console.log("NODE", node);
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }

    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit");
    }
    if (node.type === "typebot") {
      setModalAddTypebot("edit");
    }
    if (node.type === "openai") {
      setModalAddOpenAI("edit");
    }
    if (node.type === "question") {
      setModalAddQuestion("edit");
    }
  };

  const clickNode = (event, node) => {
    setDataNode(node);
    setSidebarOpen(true);
    // Ajustar visualização quando sidebar abre
    setTimeout(() => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.fitView({
          padding: 0.2,
          duration: 300,
          nodes: [node]
        });
      }
    }, 100);
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { backgroundColor: theme?.palette?.primary?.main || "#1976d2", padding: 1, borderRadius: 8 }

          };
        }
        return {
          ...item,
          style: { backgroundColor: (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark") ? (theme?.palette?.background?.paper || "#1e1e1e") : "#FFFFFF", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const clickEdge = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          style: { backgroundColor: (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark") ? (theme?.palette?.background?.paper || "#1e1e1e") : "#FFFFFF", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
    // Salvar no histórico após atualizar nó
    saveToHistory();
  };

  const actions = [
    {
      icon: (
        <RocketLaunch
          sx={{
            color: "#3ABA38",
          }}
        />
      ),
      name: "Inicio",
      type: "start",
    },
    {
      icon: (
        <LibraryBooks
          sx={{
            color: "#EC5858",
          }}
        />
      ),
      name: "ConteÃºdo",
      type: "content",
    },
    {
      icon: (
        <DynamicFeed
          sx={{
            color: "#683AC8",
          }}
        />
      ),
      name: "Menu",
      type: "menu",
    },
    {
      icon: (
        <CallSplit
          sx={{
            color: "#1FBADC",
          }}
        />
      ),
      name: "Randomizador",
      type: "random",
    },
    {
      icon: (
        <AccessTime
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Intervalo",
      type: "interval",
    },
    {
      icon: (
        <ConfirmationNumber
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Ticket",
      type: "ticket",
    },
    {
      icon: (
        <Box
          component="img"
          sx={{
            width: 24,
            height: 24,
            color: "#3aba38",
          }}
          src={typebotIcon}
          alt="icon"
        />
      ),
      name: "TypeBot",
      type: "typebot",
    },
    {
      icon: (
        <SiOpenai
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "OpenAI",
      type: "openai",
    },
    {
      icon: (
        <BallotIcon
          sx={{
            color: "#F7953B",
          }}
        />
      ),
      name: "Pergunta",
      type: "question",
    },
  ];

  const clickActions = (type) => {

    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break
      case "question":
        setModalAddQuestion("create");
        break
      default:
    }
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);
          if (data.flow.flow !== null) {
            const flowNodes = data.flow.flow.nodes;
            setNodes(flowNodes);
            setEdges(data.flow.flow.connections);
            const filterVariables = flowNodes.filter(
              (nd) => nd.type === "question"
            );
            const variables = filterVariables.map(
              (variable) => variable.data.typebotIntegration.answerKey
            );
            localStorage.setItem("variables", JSON.stringify(variables));
          }
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  // Cleanup do teste quando componente desmontar
  useEffect(() => {
    return () => {
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map((node) => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY,
        },
        selected: false,
        style: { backgroundColor: (theme?.palette?.mode === "dark" || theme?.palette?.type === "dark") ? (theme?.palette?.background?.paper || "#1e1e1e") : "#FFFFFF", padding: 0, borderRadius: 8 },
      };
      setNodes((old) => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  return (
    <Stack sx={{ height: "100vh" }}>
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />

      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddOpenAI}
      />

      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTypebot}
      />

      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddQuestion}
      />

      <MainHeader>
        <Title>Desenhe sua automação</Title>
      </MainHeader>
      {!loading && (
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          {/* Envolver com ReactFlowProvider */}
          <ReactFlowProvider>
            <FlowBuilderContent
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              doubleClick={doubleClick}
              clickNode={clickNode}
              clickEdge={clickEdge}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              dataNode={dataNode}
              updateNode={updateNode}
              clickActions={clickActions}
              actions={actions}
              saveFlow={saveFlow}
              isTestMode={isTestMode}
              onTest={handleStartTest}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onDelete={handleDeleteNode}
              onDuplicate={handleDuplicateNode}
              onExport={handleExportFlow}
              onImport={handleImportFlow}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < flowHistory.length - 1}
            />
          </ReactFlowProvider>
          {/* <Stack
                  style={{
                    backgroundColor: "#1B1B1B",
                    height: "70%",
                    width: "150px",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 1111,
                    borderRadius: 3,
                    padding: 8
                  }}
                  spacing={1}
                >
                  <Typography style={{ color: "#ffffff", textAlign: "center" }}>
                    Adicionar
                  </Typography>
                  <Button
                    onClick={() => addNode("start")}
                    variant="contained"
                    style={{
                      backgroundColor: "#3ABA38",
                      color: "#ffffff",
                      padding: 8,
                      "&:hover": {
                        backgroundColor: "#3e3b7f"
                      },
                      textTransform: "none"
                    }}
                  >
                    <RocketLaunch
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Inicio
                  </Button>
                  <Button
                    onClick={() => setModalAddText("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#6865A5",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <Message
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Texto
                  </Button>
                  <Button
                    onClick={() => setModalAddInterval("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#F7953B",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <AccessTime
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Intervalo
                  </Button>
                  <Button
                    onClick={() => setModalAddCondition("create")}
                    variant="contained"
                    disabled
                    style={{
                      backgroundColor: "#524d4d",
                      color: "#cccaed",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <ImportExport
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    CondiÃ§Ã£o
                  </Button>
                  <Button
                    onClick={() => setModalAddMenu("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#683AC8",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <DynamicFeed
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Menu
                  </Button>
                  <Button
                    onClick={() => setModalAddAudio("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#6865A5",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <MicNone
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Audio
                  </Button>
                  <Button
                    onClick={() => setModalAddVideo("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#6865A5",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <Videocam
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Video
                  </Button>
                  <Button
                    onClick={() => setModalAddImg("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#6865A5",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <Image
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Imagem
                  </Button>
                  <Button
                    onClick={() => setModalAddRandomizer("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#1FBADC",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <CallSplit
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    Randomizador
                  </Button>
                  <Button
                    onClick={() => setModalAddSingleBlock("create")}
                    variant="contained"
                    style={{
                      backgroundColor: "#EC5858",
                      color: "#ffffff",
                      padding: 8,
                      textTransform: "none"
                    }}
                  >
                    <LibraryBooks
                      sx={{
                        width: "16px",
                        height: "16px",
                        marginRight: "4px"
                      }}
                    />
                    ConteÃºdo
                  </Button>
                </Stack> */}
        </Paper>
      )}
      {loading && (
        <Stack justifyContent={"center"} alignItems={"center"} height={"70vh"}>
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};

export default FlowBuilderConfig;
