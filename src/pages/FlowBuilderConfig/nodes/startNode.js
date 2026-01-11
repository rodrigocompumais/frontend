import { ArrowForwardIos, RocketLaunch } from "@mui/icons-material";
import React, { memo } from "react";

import { Handle } from "reactflow";

export default memo(({ data, isConnectable }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        padding: "14px",
        borderRadius: "14px",
        boxShadow: "0 10px 25px rgba(56, 239, 125, 0.35)",
        border: '2px solid rgba(255, 255, 255, 0.2)',
        minWidth: "220px",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: "17px",
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          marginBottom: "8px",
          fontWeight: 700,
        }}
      >
        <RocketLaunch
          sx={{
            width: "20px",
            height: "20px",
            marginRight: "8px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          }}
        />
        <div>
          Início do Fluxo
        </div>
      </div>
      <div 
        style={{ 
          color: "rgba(255, 255, 255, 0.95)", 
          fontSize: "13px",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "8px",
          borderRadius: "8px",
          backdropFilter: "blur(10px)",
          lineHeight: "1.4",
        }}
      >
        Este bloco marca o início do seu fluxo!
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{
          background: "linear-gradient(135deg, #11998e, #38ef7d)",
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
            pointerEvents: 'none'
          }}
        />
      </Handle>
    </div>
  );
});
