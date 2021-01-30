### MODE A

a point is considered in a cube if:

```ts
(0 <= point[i]) && (point[i] < side)
``` 


a vector is considered hitting a cube (in) if:

> TODO

PROS:

- fast

CONS:

- a ray [0, 0, -1] hitting IN a cube results in a hit position which is not considered in the cube


### MODE NEXT -> depend on the orientation of a vector => next step must be in the cube

a point is considered in a cube if:

```ts
(vector[i] >= 0)
  ? ((0 <= point[i]) && (point[i] < side))
  : ((0 < point[i]) && (point[i] <= side))
```

PROS:

- coherent and uniq hit on edges

CONS:

- slower (a few)
