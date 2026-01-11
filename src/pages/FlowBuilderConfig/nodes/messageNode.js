import {
  ArrowForwardIos,
  ContentCopy,
  Delete,
  Message
} from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "reactflow";
import { useNodeStorage } from "../../../stores/useNodeStorage";

export default memo(({ data, isConnectable, id }) => {
  const storageItems = useNodeStorage();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
        minWidth: "200px",
        border: "2px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <Handle
        type="target"
        position="left"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          width: "20px",
          height: "20px",
          border: "3px solid white",
          top: "22px",
          left: "-12px",
          cursor: 'pointer',
          transition: "transform 0.2s ease",
        }}
        onConnect={params => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#fff",
            width: "10px",
            height: "10px",
            marginLeft: "3px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: 8,
          top: 8,
          cursor: "pointer",
          gap: 8,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          padding: "4px 6px",
          borderRadius: "6px",
          backdropFilter: "blur(10px)",
        }}
      >
        <ContentCopy
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("duplicate");
          }}
          sx={{ 
            width: "14px", 
            height: "14px", 
            color: "#fff",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.2)"
            }
          }}
        />

        <Delete
          onClick={() => {
            storageItems.setNodesStorage(id);
            storageItems.setAct("delete");
          }}
          sx={{ 
            width: "14px", 
            height: "14px", 
            color: "#fff",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.2)"
            }
          }}
        />
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: "16px",
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          marginBottom: "8px",
          fontWeight: 600,
        }}
      >
        <Message
          sx={{
            width: "18px",
            height: "18px",
            marginRight: "6px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          }}
        />
        <div>Mensagem</div>
      </div>
      <div 
        style={{ 
          color: "rgba(255, 255, 255, 0.95)", 
          fontSize: "13px", 
          width: 180,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "8px",
          borderRadius: "8px",
          backdropFilter: "blur(10px)",
          lineHeight: "1.4",
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          width: "20px",
          height: "20px",
          border: "3px solid white",
          top: "70%",
          right: "-12px",
          cursor: 'pointer',
          transition: "transform 0.2s ease",
        }}
        isConnectable={isConnectable}
      >
        <ArrowForwardIos
          sx={{
            color: "#fff",
            width: "10px",
            height: "10px",
            marginLeft: "2.5px",
            marginBottom: "1px",
            pointerEvents: "none"
          }}
        />
      </Handle>
    </div>
  );
});
