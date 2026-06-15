import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';

const CustomActivityChart = ({ data = [2, 5, 3, 8, 4, 9, 6], labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }) => {
  const screenWidth = Dimensions.get('window').width - 64; // Accounting for cards and padding
  const height = 130;
  const paddingX = 20;
  const paddingY = 20;
  
  const chartWidth = screenWidth - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const maxValue = Math.max(...data, 10);
  
  // Calculate points
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxValue) * chartHeight;
    return { x, y };
  });

  // Construct Bezier Path
  let dLine = '';
  let dFill = '';
  
  if (points.length > 0) {
    dLine = `M ${points[0].x} ${points[0].y}`;
    dFill = `M ${points[0].x} ${height - paddingY} L ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = (p0.x + p1.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = (p0.x + p1.x) / 2;
      const cpY2 = p1.y;
      
      dLine += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      dFill += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    
    dFill += ` L ${points[points.length - 1].x} ${height - paddingY} Z`;
  }

  return (
    <View className="items-center my-2">
      <Svg width={screenWidth} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#1a73e8" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid Lines */}
        <Line x1={paddingX} y1={paddingY} x2={screenWidth - paddingX} y2={paddingY} stroke="#dadce0" strokeWidth="1" />
        <Line x1={paddingX} y1={paddingY + chartHeight / 2} x2={screenWidth - paddingX} y2={paddingY + chartHeight / 2} stroke="#dadce0" strokeWidth="1" />
        <Line x1={paddingX} y1={height - paddingY} x2={screenWidth - paddingX} y2={height - paddingY} stroke="#dadce0" strokeWidth="1" />

        {/* Filled Path */}
        {dFill !== '' && <Path d={dFill} fill="url(#gradient)" />}

        {/* Stroke Line Path */}
        {dLine !== '' && <Path d={dLine} fill="none" stroke="#1a73e8" strokeWidth="3" />}

        {/* Point nodes */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r="5" fill="#1a73e8" />
            <Circle cx={p.x} cy={p.y} r="2" fill="#FFFFFF" />
            <SvgText
              x={p.x}
              y={height - 2}
              fill="#8E9AA8"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {labels[i]}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

export default CustomActivityChart;
