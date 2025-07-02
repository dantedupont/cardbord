import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

// --- Helper Functions from your code ---
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number, index = 0) => {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
};

// --- Component Props Type ---
type MeepleAvatarProps = {
  seed: string;
  size?: number;
};

const MeepleAvatar: React.FC<MeepleAvatarProps> = ({ seed, size = 200 }) => {
  const hash = hashCode(seed || 'default');

  const properties = useMemo(() => {
    const colorSchemes = [
      { body: '#FF6B6B', accent: '#4ECDC4' }, { body: '#45B7D1', accent: '#F7DC6F' },
      { body: '#BB8FCE', accent: '#85C1E2' }, { body: '#52BE80', accent: '#F8C471' },
      { body: '#EC7063', accent: '#A9DFBF' }, { body: '#5DADE2', accent: '#F9E79F' },
      { body: '#AF7AC5', accent: '#ABEBC6' }, { body: '#48C9B0', accent: '#F5B7B1' },
      { body: '#EB984E', accent: '#85929E' }, { body: '#73C6B6', accent: '#F1948A' }
    ];
    const colors = colorSchemes[hash % colorSchemes.length];

    const bodyWidth = 1.0 + seededRandom(hash, 1) * 0.3;
    const patterns = ['none', 'stripes', 'dots', 'checkers', 'zigzag', 'gradient'];
    const pattern = patterns[Math.floor(seededRandom(hash, 3) * patterns.length)];
    const eyeTypes = ['dots', 'lines', 'closed', 'wink'];
    const eyes = eyeTypes[Math.floor(seededRandom(hash, 4) * eyeTypes.length)];
    const hasSmile = seededRandom(hash, 5) > 0.5;
    const hasGlasses = false;
    const hasBorder = seededRandom(hash, 7) > 0.5;
    const backgroundColors = [
      '#FFF5E6', '#E6F3FF', '#FFE6E6', '#E6FFE6', '#F0E6FF', '#FFEBE6', '#E6FFF5',
      '#FFF0E6', '#E6E9FF', '#FFE6F5', '#F5F5DC', '#E0F7FA', '#FCE4EC', '#E8F5E9',
      '#F3E5F5', '#FFF8DC', '#E1F5FE', '#FFEBEE', '#F1F8E9', '#EDE7F6'
    ];
    const backgroundColor = backgroundColors[Math.floor(seededRandom(hash, 8) * backgroundColors.length)];
    const hasMustache = seededRandom(hash, 9) > 0.7;
    const tongueOut = !hasMustache && (seededRandom(hash, 10) > 0.8);
    const headwearTypes = ['none', 'tophat', 'crown', 'flower'];
    const headwear = headwearTypes[Math.floor(seededRandom(hash, 11) * headwearTypes.length)];
    const hasBlush = seededRandom(hash, 12) > 0.6;
    const flowerSide = seededRandom(hash, 13) > 0.5 ? 'left' : 'right';

    return {
      colors, bodyWidth, pattern, eyes, hasSmile,
      hasGlasses, hasBorder, backgroundColor, hasMustache, tongueOut,
      headwear, hasBlush, flowerSide
    };
  }, [hash]);

  const renderPattern = () => {
    const patternId = `pattern-${hash}`;
    switch (properties.pattern) {
      case 'stripes': return (<Defs><Pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20"><Rect width="10" height="20" fill={properties.colors.body} /><Rect x="10" width="10" height="20" fill={properties.colors.accent} /></Pattern></Defs>);
      case 'dots': return (<Defs><Pattern id={patternId} patternUnits="userSpaceOnUse" width="30" height="30"><Rect width="30" height="30" fill={properties.colors.body} /><Circle cx="15" cy="15" r="5" fill={properties.colors.accent} /></Pattern></Defs>);
      case 'checkers': return (<Defs><Pattern id={patternId} patternUnits="userSpaceOnUse" width="40" height="40"><Rect width="20" height="20" fill={properties.colors.body} /><Rect x="20" y="20" width="20" height="20" fill={properties.colors.body} /><Rect x="20" width="20" height="20" fill={properties.colors.accent} /><Rect y="20" width="20" height="20" fill={properties.colors.accent} /></Pattern></Defs>);
      case 'zigzag': return (<Defs><Pattern id={patternId} patternUnits="userSpaceOnUse" width="40" height="20"><Rect width="40" height="20" fill={properties.colors.body} /><Path d="M0,10 L10,0 L20,10 L30,0 L40,10" stroke={properties.colors.accent} strokeWidth="3" fill="none" /></Pattern></Defs>);
      case 'gradient': return (<Defs><LinearGradient id={patternId} x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor={properties.colors.body} /><Stop offset="100%" stopColor={properties.colors.accent} /></LinearGradient></Defs>);
      default: return null;
    }
  };

  const renderEyes = () => {
    const eyeY = 70;
    const eyeSpacing = 20;
    switch (properties.eyes) {
      case 'dots': return (<><Circle cx={160 - eyeSpacing} cy={eyeY} r="4" fill="#222" /><Circle cx={160 + eyeSpacing} cy={eyeY} r="4" fill="#222" /></>);
      case 'lines': return (<><Line x1={160 - eyeSpacing - 8} y1={eyeY} x2={160 - eyeSpacing + 8} y2={eyeY} stroke="#222" strokeWidth="3" strokeLinecap="round" /><Line x1={160 + eyeSpacing - 8} y1={eyeY} x2={160 + eyeSpacing + 8} y2={eyeY} stroke="#222" strokeWidth="3" strokeLinecap="round" /></>);
      case 'closed': return (<><Path d={`M ${160 - eyeSpacing - 8} ${eyeY} Q ${160 - eyeSpacing} ${eyeY + 5} ${160 - eyeSpacing + 8} ${eyeY}`} stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /><Path d={`M ${160 + eyeSpacing - 8} ${eyeY} Q ${160 + eyeSpacing} ${eyeY + 5} ${160 + eyeSpacing + 8} ${eyeY}`} stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></>);
      case 'wink': return (<><Circle cx={160 - eyeSpacing} cy={eyeY} r="4" fill="#222" /><Path d={`M ${160 + eyeSpacing - 8} ${eyeY} Q ${160 + eyeSpacing} ${eyeY + 5} ${160 + eyeSpacing + 8} ${eyeY}`} stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></>);
      default: return null;
    }
  };

  const renderMouth = () => {
    if (properties.hasMustache) return null;

    if (properties.tongueOut) {
      return (
        <G>
          <Path d="M 145 88 Q 160 98 175 88" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M 175 88 C 185 91, 185 109, 160 93 Q 174 93, 175 88 Z" fill="#E74C3C" stroke="#222" strokeWidth="1.5" strokeLinejoin="round"/>
        </G>
      );
    }
    if (properties.hasSmile) {
      return <Path d="M 145 88 Q 160 98 175 88" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    return null;
  };
  
  const renderMustache = () => {
    if (!properties.hasMustache) return null;
    return (
      <G fill="#4A3728">
        <Path d="M 165 88 C 150 80, 145 85, 142 88 C 140 95, 130 95, 125 92 Q 145 105 160 88 Z" />
        <Path d="M 155 88 C 170 80, 175 85, 178 88 C 180 95, 190 95, 195 92 Q 175 105 160 88 Z" />
      </G>
    );
  };

  const renderGlasses = () => {
    if (!properties.hasGlasses) return null;
    const eyeY = 70;
    const eyeSpacing = 20;
    return (
      <G>
        <Rect x={160 - eyeSpacing - 15} y={eyeY - 12} width="30" height="24" rx="4" fill="none" stroke="#222" strokeWidth="3" />
        <Rect x={160 + eyeSpacing - 15} y={eyeY - 12} width="30" height="24" rx="4" fill="none" stroke="#222" strokeWidth="3" />
        <Line x1={160 - eyeSpacing + 15} y1={eyeY} x2={160 + eyeSpacing - 15} y2={eyeY} stroke="#222" strokeWidth="3" />
      </G>
    );
  };
  
  const renderBlush = () => {
      if (!properties.hasBlush) return null;
      return (
          <>
            <Ellipse cx="135" cy="78" rx="10" ry="5" fill="rgba(255, 105, 180, 0.5)" />
            <Ellipse cx="185" cy="78" rx="10" ry="5" fill="rgba(255, 105, 180, 0.5)" />
          </>
      );
  };
  
  const renderHeadwear = () => {
      const headwearColor = '#333';
      switch(properties.headwear) {
          case 'tophat':
              return (
                  <G fill={headwearColor}>
                      <Rect x="130" y="15" width="60" height="30" />
                      <Rect x="115" y="45" width="90" height="8" />
                  </G>
              );
          case 'crown':
              return (
                  <G fill="#F1C40F">
                      <Path d="M 120 45 L 130 25 L 145 40 L 160 20 L 175 40 L 190 25 L 200 45 Z" stroke="#DAA520" strokeWidth="3" strokeLinejoin="round" />
                  </G>
              );
          case 'flower':
              const flowerX = properties.flowerSide === 'left' ? 130 : 190;
              return (
                  <G transform={`translate(${flowerX - 160}, 40)`}>
                      <Circle cx="10" cy="0" r="7" fill="#E74C3C" />
                      <Circle cx="-10" cy="0" r="7" fill="#E74C3C" />
                      <Circle cx="0" cy="10" r="7" fill="#E74C3C" />
                      <Circle cx="0" cy="-10" r="7" fill="#E74C3C" />
                      <Circle cx="0" cy="0" r="5" fill="#F1C40F" />
                  </G>
              );
          default:
              return null;
      }
  };

  const fillColor = properties.pattern !== 'none' ? `url(#pattern-${hash})` : properties.colors.body;
  const strokeWidth = properties.hasBorder ? "6" : "0";

  return (
    <View style={{ width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox="0 0 320 320">
        <Rect width="320" height="320" fill={properties.backgroundColor} />
        <G transform="translate(0, -15)">
          {renderPattern()}
          <Path
            d={`M 160 40 C ${160 + 30 * properties.bodyWidth} 40 ${160 + 45 * properties.bodyWidth} 65 ${160 + 45 * properties.bodyWidth} 95 
                C ${160 + 45 * properties.bodyWidth} 100 ${160 + 75} 115 ${160 + 95} 130 C ${160 + 105} 138 ${160 + 110} 142 ${160 + 110} 145 
                C ${160 + 115} 155 ${160 + 110} 165 ${160 + 100} 170 C ${160 + 90} 172 ${160 + 80} 170 ${160 + 70} 167 
                C ${160 + 50 * properties.bodyWidth} 165 ${160 + 48 * properties.bodyWidth} 163 ${160 + 50 * properties.bodyWidth} 165 
                L ${160 + 85 * properties.bodyWidth} 290 L ${160 + 12} 290 L ${160 + 5} 245 L ${160 - 5} 245 L ${160 - 12} 290 L ${160 - 85 * properties.bodyWidth} 290 
                L ${160 - 50 * properties.bodyWidth} 165 C ${160 - 48 * properties.bodyWidth} 163 ${160 - 50 * properties.bodyWidth} 165 ${160 - 70} 167 
                C ${160 - 80} 170 ${160 - 90} 172 ${160 - 100} 170 C ${160 - 110} 165 ${160 - 115} 155 ${160 - 110} 145 C ${160 - 110} 142 ${160 - 105} 138 ${160 - 95} 130 
                C ${160 - 75} 115 ${160 - 45 * properties.bodyWidth} 100 ${160 - 45 * properties.bodyWidth} 95 
                C ${160 - 45 * properties.bodyWidth} 65 ${160 - 30 * properties.bodyWidth} 40 160 40 Z`}
            fill={fillColor}
            stroke="#222"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <G transform="translate(0, 0)">
            {renderBlush()}
            {renderEyes()}
            {renderMouth()}
            {renderMustache()}
            {renderGlasses()}
            {renderHeadwear()}
          </G>
        </G>
      </Svg>
    </View>
  );
};

export default MeepleAvatar;
