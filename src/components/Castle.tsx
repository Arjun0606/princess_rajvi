import { Sprite } from './Sprite';

const PALETTE = {
  P: '#ffb1cf',
  p: '#ff7fae',
  D: '#c95689',
  W: '#ffffff',
  Y: '#ffd84d',
  G: '#ff5d8f',
  K: '#3d1f30',
  S: '#88ddff',
  F: '#ff5577',
  s: '#5fb7d6',
};

// Pink castle silhouette, ~32 wide × 22 tall. Two main towers, central
// gate w/ heart, sky/window glow. Sits centered behind the princess.
const ROWS = [
  '...........F....................',
  '...........F....................',
  '..YYYY...YYYYY...YYYY...........',
  '..PpPP...PpPpP...PpPP...........',
  '..PpPP...PpPpP...PpPP...........',
  '..PpPP.YYYYYYYYY.PpPP...........',
  '..PpPP.PpPpPpPpP.PpPP...........',
  '..PpPP.PpSSSSSPP.PpPP...........',
  '..PpPP.PpSWGSSPP.PpPP...........', // window with heart
  'PPPPPPPPPpPPPPPPPPPPPPP.........',
  'PpPpPpPpPpPpPpPpPpPpPpP.........',
  'PpSSPpSSPpPPPPPPPpSSPpP.........',  // arched windows
  'PpSSPpSSPpDDDDDPpSSPpPP.........',
  'PpPPPpPPPpDGGDPpPPPpPPP.........',  // gate w/ heart
  'PpPPPpPPPpDDDDPpPPPpPPP.........',
  'PpPPPpPPPpDDDDPpPPPpPPP.........',
  'PpPPPpPPPpDDDDPpPPPpPPP.........',
  'KKKKKKKKKKKKKKKKKKKKKKK.........',
  'KKKKKKKKKKKKKKKKKKKKKKK.........',
];

export const Castle = ({ size = 6 }: { size?: number }) => (
  <Sprite rows={ROWS} palette={PALETTE} pixel={size} ariaLabel="Pink castle" />
);
