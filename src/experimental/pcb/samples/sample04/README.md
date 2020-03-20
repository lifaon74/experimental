board: 10x10mm
top copper: arc with center 5x5, starting at 5x7.5, ending at 7.5x5 (90deg) with a thickness of 0.3

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
D10* // use aperture 10
G75* //  multi-quadrant mode
G01*
X5000Y7500D02* // move to 5x7.5
G02* // clockwise
X7500Y5000I0J-2500D01*  // write arc ending at (X, Y) = (7.5, 5)
                        // with a center at (I, J) = (0, -2.5)
                        // relative to the start point (5, 7.5) => center = (5 + 0, 7.5 - 2.5) => (5, 5)


