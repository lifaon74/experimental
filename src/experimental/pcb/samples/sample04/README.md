board: 10x10mm
top copper: arc with center 5x5, starting at 5x2.5, ending at 7.5x5 (90deg) with a thickness of 0.3

// fill
G36*
G75*
G01*
X5000Y7500D02*
G02*
X7500Y5000I0J-2500D01*
G37*

// empty
%ADD10C,.3*%
D10*
G75*
G01*
X5000Y7500D02*
G02*
X7500Y5000I0J-2500D01*


