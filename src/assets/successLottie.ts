/**
 * Lottie JSON Animation Data for Payment Recovery Success
 * Pure vector Bodymovin schema (no external CDN asset dependency)
 */
export const successLottieData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "PaymentRecoverySuccess",
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Checkmark Path with dynamic draw
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Checkmark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          nm: "CheckGroup",
          it: [
            {
              ty: "sh",
              nm: "CheckPath",
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-22, 2], [-7, 18], [24, -14]],
                  c: false
                }
              }
            },
            {
              ty: "st",
              nm: "CheckStroke",
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 7 },
              lc: 2,
              lj: 2
            },
            {
              ty: "tm",
              nm: "TrimPath",
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 15, s: [0] },
                  { t: 42, s: [100] }
                ]
              },
              o: { a: 0, k: 0 },
              m: 1
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Layer 2: Main Circle Fill with Spring Expansion
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "CircleFill",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 0, s: [0, 0, 100] },
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 18, s: [112, 112, 100] },
            { t: 28, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          nm: "CircleGroup",
          it: [
            {
              ty: "el",
              nm: "CirclePath",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [80, 80] }
            },
            {
              ty: "fl",
              nm: "CircleFill",
              c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
              o: { a: 0, k: 100 }
            },
            {
              ty: "st",
              nm: "CircleBorder",
              c: { a: 0, k: [0.431, 0.941, 0.698, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Layer 3: Expanding Sonar Ring Wave
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "PulseRing",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 6, s: [100] },
            { t: 48, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 6, s: [70, 70, 100] },
            { t: 48, s: [165, 165, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          nm: "PulseGroup",
          it: [
            {
              ty: "el",
              nm: "PulseEllipse",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [80, 80] }
            },
            {
              ty: "st",
              nm: "PulseStroke",
              c: { a: 0, k: [0.2, 0.88, 0.65, 1] },
              o: { a: 0, k: 80 },
              w: { a: 0, k: 3 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Layer 4: Burst Spark (Top)
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: "SparkTop",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 12, s: [0] },
            { t: 22, s: [100] },
            { t: 48, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 12, s: [100, 50, 0] },
            { t: 48, s: [100, 24, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 12, s: [30, 30, 100] },
            { t: 25, s: [100, 100, 100] },
            { t: 48, s: [0, 0, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          nm: "SparkTopGroup",
          it: [
            {
              ty: "el",
              nm: "Dot",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [8, 8] }
            },
            {
              ty: "fl",
              nm: "DotFill",
              c: { a: 0, k: [0.98, 0.75, 0.18, 1] },
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Layer 5: Burst Spark (Right)
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: "SparkRight",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 12, s: [0] },
            { t: 22, s: [100] },
            { t: 48, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 12, s: [148, 100, 0] },
            { t: 48, s: [176, 100, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 12, s: [30, 30, 100] },
            { t: 25, s: [100, 100, 100] },
            { t: 48, s: [0, 0, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          nm: "SparkRightGroup",
          it: [
            {
              ty: "el",
              nm: "Dot",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [7, 7] }
            },
            {
              ty: "fl",
              nm: "DotFill",
              c: { a: 0, k: [0.34, 0.85, 0.95, 1] },
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    // Layer 6: Burst Spark (Left)
    {
      ddd: 0,
      ind: 6,
      ty: 4,
      nm: "SparkLeft",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 12, s: [0] },
            { t: 22, s: [100] },
            { t: 48, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] }, t: 12, s: [52, 100, 0] },
            { t: 48, s: [24, 100, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 12, s: [30, 30, 100] },
            { t: 25, s: [100, 100, 100] },
            { t: 48, s: [0, 0, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          nm: "SparkLeftGroup",
          it: [
            {
              ty: "el",
              nm: "Dot",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [7, 7] }
            },
            {
              ty: "fl",
              nm: "DotFill",
              c: { a: 0, k: [0.2, 0.9, 0.5, 1] },
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};
