"use strict";
(self.webpackChunkonitama_app = self.webpackChunkonitama_app || []).push([[404], {
    9299: function(e, n, r) {
        r.d(n, {
            Z: function() {
                return K
            }
        });
        var t = r(885)
          , a = r(7313)
          , o = r(8303)
          , i = r(1385)
          , s = r(5282)
          , l = r(8632)
          , c = r(337)
          , d = r(858)
          , u = r(4942)
          , v = r(7241)
          , f = r(4069)
          , p = r(4070)
          , x = r(5939)
          , m = r(5154)
          , h = r(7009)
          , Z = r(3061)
          , y = r(2599)
          , j = r(6417)
          , g = (0,
        v.Z)((function(e) {
            var n;
            return {
                blue: {
                    color: e.palette.info.main
                },
                red: {
                    color: e.palette.error.main
                },
                dialog: (n = {
                    padding: e.spacing(2)
                },
                (0,
                u.Z)(n, e.breakpoints.up("md"), {
                    padding: e.spacing(8)
                }),
                (0,
                u.Z)(n, "display", "flex"),
                (0,
                u.Z)(n, "flexDirection", "column"),
                (0,
                u.Z)(n, "justifyContent", "center"),
                (0,
                u.Z)(n, "alignItems", "center"),
                n)
            }
        }
        ))
          , b = {
            OpponentRematchRequested: "Opponent requested a rematch",
            RematchRequested: "Rematch request sent"
        };
        function GameOver(e) {
            var n, r = e.winner, t = e.reset, a = e.player, i = e.connectionStatus, s = e.minimizedGameOver, d = e.setMinimizedGameOver, v = g(), M = a === r ? "You Win!" : "You Lose!", C = "".concat(r, " wins!"), w = a ? M : C, k = b[i];
            return (0,
            j.jsxs)(f.Z, {
                open: Boolean(r) && !s,
                classes: {
                    paper: v.dialog
                },
                children: [(0,
                j.jsx)(l.Z, {
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    children: (0,
                    j.jsx)(p.Z, {
                        onClick: function onClick() {
                            return d(!0)
                        },
                        children: (0,
                        j.jsx)(y.Z, {})
                    })
                }), (0,
                j.jsx)(x.Z, {
                    className: (0,
                    Z.Z)((n = {},
                    (0,
                    u.Z)(n, v.red, "Red" === r),
                    (0,
                    u.Z)(n, v.blue, "Blue" === r),
                    n)),
                    children: w
                }), (0,
                j.jsxs)(m.Z, {
                    children: [(0,
                    j.jsx)(c.Z, {
                        variant: "contained",
                        onClick: t,
                        color: "primary",
                        children: "Rematch"
                    }), (0,
                    j.jsx)(c.Z, {
                        variant: "outlined",
                        color: "secondary",
                        component: o.rU,
                        to: "/",
                        children: "Main Menu"
                    })]
                }), (0,
                j.jsx)(h.Z, {
                    variant: "subtitle1",
                    children: k
                })]
            })
        }
        GameOver.defaultProps = {
            winner: null,
            player: null,
            connectionStatus: null
        };
        var M = GameOver
          , C = r(719)
          , w = r(2277)
          , k = r(8323)
          , G = r(1969)
          , R = r(935)
          , S = r(2901)
          , D = r.n(S)
          , B = r(5192)
          , O = r.n(B)
          , I = O().shape({
            x: O().number.isRequired,
            y: O().number.isRequired
        })
          , P = (O().shape({
            card: O().string.isRequired,
            moves: O().arrayOf(I).isRequired,
            direction: O().string.isRequired
        }),
        {
            Empty: null,
            BluePawn: (0,
            j.jsx)(G.G, {
                icon: R.rvC,
                color: "#2196f3",
                size: "3x"
            }),
            BlueKing: (0,
            j.jsx)(G.G, {
                icon: R.jAG,
                color: "#2196f3",
                size: "3x"
            }),
            RedPawn: (0,
            j.jsx)(G.G, {
                icon: R.rvC,
                color: "#f44336",
                size: "3x"
            }),
            RedKing: (0,
            j.jsx)(G.G, {
                icon: R.jAG,
                color: "#f44336",
                size: "3x"
            })
        })
          , q = (0,
        v.Z)((function(e) {
            return {
                selected: {
                    borderColor: e.palette.primary.main
                },
                valid: {
                    borderColor: e.palette.secondary.dark
                },
                selectable: {
                    "&:hover": {
                        borderColor: e.palette.primary.main
                    },
                    cursor: "pointer"
                },
                lastMove: {},
                redBase: {
                    backgroundColor: D()(e.palette.background.paper).mix(D()("#f44336"), .1).hex()
                },
                blueBase: {
                    backgroundColor: D()(e.palette.background.paper).mix(D()("#2196f3"), .1).hex()
                },
                rankMarker: {
                    position: "absolute",
                    transform: "translate(-20px, -20px)"
                }
            }
        }
        ))
          , z = {
            BluePawn: "Blue",
            BlueKing: "Blue",
            RedPawn: "Red",
            RedKing: "Red"
        };
        function Skull() {
            var e = q();
            return (0,
            j.jsx)(k.ZP, {
                title: "likely lose",
                children: (0,
                j.jsx)(l.Z, {
                    className: e.rankMarker,
                    children: (0,
                    j.jsx)(G.G, {
                        icon: R.bE7,
                        color: "#ffffff",
                        size: "xs"
                    })
                })
            })
        }
        function Star() {
            var e = q();
            return (0,
            j.jsx)(k.ZP, {
                title: "guaranteed win",
                children: (0,
                j.jsx)(l.Z, {
                    className: e.rankMarker,
                    children: (0,
                    j.jsx)(G.G, {
                        icon: R.Tab,
                        color: "#ffff00",
                        size: "xs",
                        bounce: !0
                    })
                })
            })
        }
        function GameSquare(e) {
            var n, r, t, a, o, i = e.tile, s = e.x, c = e.y, d = e.src, v = e.setSrc, f = e.turn, p = e.move, x = e.isValid, m = e.lastMove, h = e.ranking, y = q(), g = f === z[i], b = s === (null === d || void 0 === d ? void 0 : d.x) && c === (null === d || void 0 === d ? void 0 : d.y), M = !b && Boolean(g || d), C = s === (null === m || void 0 === m || null === (n = m.src) || void 0 === n ? void 0 : n.x) && c === (null === m || void 0 === m || null === (r = m.src) || void 0 === r ? void 0 : r.y), k = s === (null === m || void 0 === m || null === (t = m.dst) || void 0 === t ? void 0 : t.x) && c === (null === m || void 0 === m || null === (a = m.dst) || void 0 === a ? void 0 : a.y), G = C || k;
            return (0,
            j.jsxs)(w.Z, {
                variant: "outlined",
                component: l.Z,
                width: "64px",
                height: "64px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                className: (0,
                Z.Z)((o = {},
                (0,
                u.Z)(o, y.selected, b),
                (0,
                u.Z)(o, y.selectable, M || x),
                (0,
                u.Z)(o, y.valid, x),
                (0,
                u.Z)(o, y.redBase, 2 === s && 4 === c),
                (0,
                u.Z)(o, y.blueBase, 2 === s && 0 === c),
                (0,
                u.Z)(o, y.lastMove, G && !x),
                o)),
                onClick: function onClick() {
                    g ? v({
                        x: s,
                        y: c
                    }) : p({
                        x: s,
                        y: c
                    })
                },
                children: [h < -1e6 && (0,
                j.jsx)(Skull, {}), h > 1e6 && (0,
                j.jsx)(Star, {}), P[i]]
            })
        }
        GameSquare.defaultProps = {
            src: null,
            turn: null,
            lastMove: null
        };
        var E = GameSquare
          , W = (0,
        v.Z)((function() {
            return {
                svg: {
                    position: "absolute",
                    width: "320px",
                    height: "320px",
                    pointerEvents: "none"
                }
            }
        }
        ))
          , T = 180 / Math.PI;
        function LastMove(e) {
            var n = e.lastMove
              , r = e.redOriented
              , t = W();
            if (!n)
                return null;
            var a = n.src
              , o = n.dst
              , i = o.x - a.x
              , s = o.y - a.y
              , l = Math.atan2(s, i) * T
              , c = r ? l : l + 180
              , d = 64 * Math.sqrt(Math.pow(i, 2) + Math.pow(s, 2))
              , u = [[0, 0], [d - 24, -3], [d - 24, -12], [d - 12, 0], [d - 24, 12], [d - 24, 3]].flatMap((function(e) {
                return e.toString()
            }
            )).join(" ")
              , v = r ? a.x : 4 - a.x
              , f = r ? a.y : 4 - a.y;
            return (0,
            j.jsx)("svg", {
                className: t.svg,
                children: (0,
                j.jsx)("g", {
                    transform: "translate(".concat(64 * v + 32, " ").concat(64 * f + 32, ") rotate(").concat(c, ")"),
                    children: (0,
                    j.jsx)("polygon", {
                        points: u,
                        stroke: "rgba(80, 255, 80, 0.15)",
                        fill: "transparent",
                        strokeWidth: "3"
                    })
                })
            })
        }
        LastMove.defaultProps = {
            lastMove: null
        };
        var U = LastMove;
        function GameGrid(e) {
            var n = e.grid
              , r = e.isMoveValid
              , t = e.src
              , a = e.setSrc
              , o = e.turn
              , i = e.move
              , s = e.lastMove
              , c = e.redOriented
              , d = e.dstMoveRankings;
            return (0,
            j.jsxs)(w.Z, {
                component: l.Z,
                display: "flex",
                flexDirection: c ? "column" : "column-reverse",
                my: 2,
                children: [(0,
                j.jsx)(U, {
                    lastMove: s,
                    redOriented: c
                }), n.map((function(e, n) {
                    return (0,
                    j.jsx)(l.Z, {
                        display: "flex",
                        flexDirection: c ? "row" : "row-reverse",
                        children: e.map((function(e, l) {
                            return (0,
                            j.jsx)(E, {
                                tile: e,
                                x: l,
                                y: n,
                                src: t,
                                setSrc: a,
                                turn: o,
                                move: i,
                                isValid: r(l, n),
                                lastMove: s,
                                ranking: (d["".concat(l, ",").concat(n)] || 0) * (c ? 1 : -1)
                            }, "".concat(l, "-").concat(n))
                        }
                        ))
                    }, n)
                }
                ))]
            })
        }
        GameGrid.defaultProps = {
            src: null,
            turn: null,
            lastMove: null
        };
        var N = GameGrid;
        function GameHand(e) {
            var n = e.cards
              , r = e.setCard
              , t = e.selectedCard
              , a = e.canMove
              , o = e.enabled
              , c = e.discard
              , d = e.spare
              , u = e.isPlayerTurn
              , v = e.inverted
              , f = (0,
            i.Z)()
              , p = (0,
            s.Z)(f.breakpoints.down("sm")) && !u;
            return (0,
            j.jsxs)(l.Z, {
                display: "flex",
                flexDirection: v ? "row-reverse" : "row",
                style: {
                    gap: "8px"
                },
                children: [p && (0,
                j.jsx)(C.Z, {
                    setCard: r,
                    name: d.card,
                    direction: d.direction,
                    selected: !1,
                    moves: d.moves,
                    enabled: o,
                    canMove: a,
                    discard: c,
                    showPlayed: !0,
                    inverted: !v
                }), n.map((function(e) {
                    var n = e.card
                      , i = e.moves
                      , s = e.direction;
                    return (0,
                    j.jsx)(C.Z, {
                        setCard: r,
                        name: n,
                        direction: s,
                        selected: (null === t || void 0 === t ? void 0 : t.card) === n,
                        moves: i,
                        enabled: o,
                        canMove: a,
                        discard: c,
                        inverted: v
                    }, n)
                }
                ))]
            })
        }
        GameHand.defaultProps = {
            selectedCard: null,
            inverted: !1
        };
        var L = GameHand
          , V = (0,
        v.Z)((function() {
            return {
                Red: {
                    color: "#f44336"
                },
                Blue: {
                    color: "#2196f3"
                }
            }
        }
        ));
        function GameTurn(e) {
            var n = e.turn
              , r = e.player
              , t = V()
              , a = r === n ? "Your Turn" : "Opponent's Turn"
              , o = "".concat(n, "'s Turn")
              , i = r ? a : o;
            return (0,
            j.jsx)(l.Z, {
                children: (0,
                j.jsx)(h.Z, {
                    variant: "h4",
                    className: t[n],
                    children: i
                })
            })
        }
        GameTurn.defaultProps = {
            player: null
        };
        var H = GameTurn;
        function GameScore(e) {
            var n = e.score
              , r = e.stale
              , t = e.playerIsRed;
            if (!n)
                return null;
            var a = "#f44336"
              , o = "#2196f3"
              , i = t ? o : a
              , s = t ? a : o;
            return (0,
            j.jsx)(l.Z, {
                maxWidth: "0px",
                height: "100%",
                style: {
                    opacity: r ? .5 : 1
                },
                children: (0,
                j.jsx)(l.Z, {
                    height: "100%",
                    width: "8px",
                    bgcolor: i,
                    overflow: "hidden",
                    borderRadius: "4px",
                    children: (0,
                    j.jsx)(l.Z, {
                        height: "100%",
                        width: "8px",
                        bgcolor: s,
                        style: {
                            transform: "translateY(".concat((100 - n).toFixed(0), "%)"),
                            transition: "transform 1s"
                        }
                    })
                })
            })
        }
        GameScore.defaultProps = {
            stale: !0,
            score: null
        };
        var A = GameScore;
        function GameBoard(e) {
            var n = e.src
              , r = e.setSrc
              , u = e.grid
              , v = e.winner
              , f = e.player
              , p = e.turn
              , x = e.spare
              , m = e.blueCards
              , h = e.redCards
              , Z = e.setCard
              , y = e.card
              , g = e.canMove
              , b = e.lastMove
              , w = e.dstMoveRankings
              , k = e.connectionStatus
              , G = e.isMoveValid
              , R = e.move
              , S = e.discard
              , D = e.reset
              , B = e.canUndo
              , O = e.undo
              , I = e.score
              , P = e.stale
              , q = (0,
            i.Z)()
              , z = (0,
            a.useState)(!1)
              , E = (0,
            t.Z)(z, 2)
              , W = E[0]
              , T = E[1];
            (0,
            a.useEffect)((function() {
                v || T(!1)
            }
            ), [v, T]);
            var U = (0,
            s.Z)(q.breakpoints.down("sm"))
              , V = !f || f === p
              , K = "Blue" !== f;
            return (0,
            j.jsxs)(l.Z, {
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                children: [(0,
                j.jsx)(l.Z, {
                    display: "flex",
                    justifyContent: "center",
                    children: (0,
                    j.jsx)(H, {
                        player: f,
                        turn: p
                    })
                }), (0,
                j.jsxs)(l.Z, {
                    display: "flex",
                    flexDirection: K ? "row" : "row-reverse",
                    children: [(0,
                    j.jsx)(l.Z, {
                        position: "absolute",
                        top: "0",
                        left: "0",
                        children: (0,
                        j.jsx)(c.Z, {
                            component: o.rU,
                            to: "/",
                            children: "Home"
                        })
                    }), (0,
                    j.jsx)(M, {
                        reset: D,
                        winner: v,
                        player: f,
                        connectionStatus: k,
                        minimizedGameOver: W,
                        setMinimizedGameOver: T
                    }), (0,
                    j.jsx)(l.Z, {
                        display: U ? "none" : "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        flexBasis: "33%",
                        children: "Blue" === p && (0,
                        j.jsx)(C.Z, {
                            spare: !0,
                            inverted: K,
                            moves: x.moves,
                            enabled: !1,
                            setCard: Z,
                            name: x.card,
                            direction: x.direction,
                            selected: !1
                        })
                    }), (0,
                    j.jsxs)(l.Z, {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                        children: [(0,
                        j.jsxs)(l.Z, {
                            display: "flex",
                            flexDirection: K ? "column" : "column-reverse",
                            children: [(0,
                            j.jsx)(L, {
                                setCard: Z,
                                selectedCard: y,
                                spare: x,
                                discard: S,
                                canMove: g,
                                cards: m,
                                enabled: "Blue" === p && V,
                                isPlayerTurn: "Blue" === p,
                                inverted: K
                            }), (0,
                            j.jsx)(N, {
                                isMoveValid: G,
                                move: R,
                                src: n,
                                setSrc: r,
                                grid: u,
                                turn: p,
                                lastMove: b,
                                dstMoveRankings: w || {},
                                redOriented: K
                            }), (0,
                            j.jsx)(L, {
                                setCard: Z,
                                selectedCard: y,
                                spare: x,
                                discard: S,
                                canMove: g,
                                cards: h,
                                enabled: "Red" === p && V,
                                isPlayerTurn: "Red" === p,
                                inverted: !K
                            })]
                        }), (0,
                        j.jsx)(A, {
                            score: I,
                            stale: P,
                            playerIsRed: "Red" === f
                        })]
                    }), (0,
                    j.jsx)(l.Z, {
                        display: U ? "none" : "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        flexBasis: "33%",
                        children: "Red" === p && (0,
                        j.jsx)(C.Z, {
                            spare: !0,
                            inverted: !K,
                            moves: x.moves,
                            enabled: !1,
                            setCard: Z,
                            name: x.card,
                            direction: x.direction,
                            selected: !1
                        })
                    })]
                }), O && (0,
                j.jsx)(l.Z, {
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                    children: (0,
                    j.jsx)(l.Z, {
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: "320px",
                        children: (0,
                        j.jsx)(c.Z, {
                            variant: "contained",
                            disabled: !B,
                            startIcon: (0,
                            j.jsx)(d.Z, {}),
                            onClick: O,
                            children: "Undo last move"
                        })
                    })
                }), W && Boolean(v) && (0,
                j.jsx)(l.Z, {
                    p: 1,
                    display: "flex",
                    position: "sticky",
                    justifyContent: "center",
                    bottom: "0px",
                    width: "100%",
                    children: (0,
                    j.jsx)(l.Z, {
                        width: "100%",
                        maxWidth: "320px",
                        display: "flex",
                        flexDirection: "column",
                        children: (0,
                        j.jsx)(c.Z, {
                            variant: "contained",
                            onClick: D,
                            children: "Rematch"
                        })
                    })
                })]
            })
        }
        GameBoard.defaultProps = {
            card: null,
            src: null,
            winner: null,
            reset: null,
            player: null,
            lastMove: null,
            dstMoveRankings: null,
            connectionStatus: null,
            canUndo: null,
            undo: null,
            score: null,
            stale: !0
        };
        var K = GameBoard
    },
    404: function(e, n, r) {
        r.r(n),
        r.d(n, {
            default: function() {
                return B
            }
        });
        var t = r(885)
          , a = r(7313)
          , o = r(3885)
          , i = r(3830)
          , s = r(2553)
          , l = r(9299)
          , c = r(1413)
          , d = r(6287)
          , u = r(7471)
          , v = r(7988)
          , f = r(1805)
          , p = r(4474)
          , x = r(5054)
          , m = function useMultiplayer(e, n) {
            var r = (0,
            x.zs)()
              , s = (0,
            a.useState)(null)
              , l = (0,
            t.Z)(s, 2)
              , m = l[0]
              , h = l[1]
              , Z = (0,
            a.useState)({})
              , y = (0,
            t.Z)(Z, 2)
              , j = y[0]
              , g = y[1]
              , b = (0,
            o.Ds)().enqueueSnackbar
              , M = (0,
            a.useState)(!1)
              , C = (0,
            t.Z)(M, 2)
              , w = C[0]
              , k = C[1]
              , G = (0,
            i.k6)()
              , R = (0,
            a.useCallback)((function() {
                k((function(e) {
                    return !e
                }
                ))
            }
            ), [k, null === m || void 0 === m ? void 0 : m.roomId, G]);
            (0,
            a.useEffect)((function() {
                var t = !0
                  , a = function setStateMounted(e) {
                    t && h(e)
                }
                  , o = "".concat(d.Wb).concat(n ? "ai/" : "").concat(e || "")
                  , i = new WebSocket(o)
                  , s = setInterval((function() {
                    i.send("ping")
                }
                ), 3e4);
                i.binaryType = "arraybuffer";
                var l = new u.Gz((0,
                p.Z)(),a,(function onError(e) {
                    b(e, {
                        variant: "error",
                        persist: !1
                    }),
                    r()
                }
                ),(function onSend(e) {
                    i.send(e)
                }
                ),f.Z);
                g({
                    playMove: function playMove(e) {
                        return l.move(e)
                    },
                    reset: function reset() {
                        return l.reset()
                    }
                });
                return i.addEventListener("close", (function onClose() {
                    v.Z.log("Disconnected"),
                    a((function(e) {
                        return (0,
                        c.Z)((0,
                        c.Z)({}, e), {}, {
                            connection: "Disconnected"
                        })
                    }
                    ))
                }
                )),
                i.addEventListener("message", (function onMessage(e) {
                    "string" === typeof e.data ? v.Z.log("Received string", e.data) : l.handleMsg(e)
                }
                )),
                function() {
                    clearInterval(s),
                    t = !1,
                    i.close(1e3)
                }
            }
            ), [b, e, G, w, n]);
            var S = null === m || void 0 === m ? void 0 : m.roomId;
            return (0,
            a.useEffect)((function() {
                S && !e && G.replace("/r/".concat(S))
            }
            ), [G, e, S, r]),
            v.Z.log(m),
            (0,
            c.Z)({
                state: m,
                reconnect: R
            }, j)
        }
          , h = r(8303)
          , Z = r(7241)
          , y = r(4069)
          , j = r(5939)
          , g = r(8371)
          , b = r(8632)
          , M = r(7009)
          , C = r(6672)
          , w = r(337)
          , k = r(5154)
          , G = r(6417)
          , R = (0,
        Z.Z)((function(e) {
            return {
                dialog: {
                    padding: e.spacing(8, 8, 8, 8),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                },
                content: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                },
                invite: {
                    fontSize: "12px"
                }
            }
        }
        ))
          , S = {
            Waiting: "Waiting for Opponent",
            OpponentDisconnected: "Opponent disconnected, waiting for them to re-connect",
            Disconnected: "Disconnected from server",
            Errored: "Game Error"
        };
        var D = function WaitingOverlay(e) {
            var n = e.state
              , r = n.connection
              , t = n.roomId
              , o = n.error
              , i = e.reconnect
              , s = R()
              , l = (0,
            a.useRef)()
              , c = S[r] || r
              , d = "Connecting" === r
              , u = "Disconnected" === r
              , v = "Errored" === r
              , f = "Waiting" === r || d || u || "OpponentDisconnected" === r || v
              , p = u || v
              , x = (0,
            a.useCallback)((function() {
                l.current.select(),
                l.current.setSelectionRange(0, 9999),
                document.execCommand("copy")
            }
            ), []);
            return (0,
            G.jsxs)(y.Z, {
                open: f,
                classes: {
                    paper: s.dialog
                },
                transitionDuration: 0,
                children: [(0,
                G.jsx)(j.Z, {
                    children: c
                }), (0,
                G.jsxs)(g.Z, {
                    className: s.content,
                    children: [!d && !p && t && (0,
                    G.jsxs)(G.Fragment, {
                        children: [(0,
                        G.jsxs)(b.Z, {
                            minWidth: "280px",
                            children: [(0,
                            G.jsx)(M.Z, {
                                variant: "subtitle1",
                                children: "Invite Link"
                            }), (0,
                            G.jsxs)(b.Z, {
                                display: "flex",
                                flexDirection: "row",
                                children: [(0,
                                G.jsx)(C.Z, {
                                    inputRef: l,
                                    className: s.invite,
                                    value: "".concat(window.location.origin, "/#/r/").concat(t),
                                    spellCheck: !1,
                                    variant: "outlined"
                                }), (0,
                                G.jsx)(b.Z, {
                                    m: .5
                                }), (0,
                                G.jsx)(w.Z, {
                                    variant: "contained",
                                    color: "primary",
                                    size: "small",
                                    onClick: x,
                                    children: "Copy"
                                })]
                            })]
                        }), (0,
                        G.jsx)(b.Z, {
                            pt: 2,
                            children: (0,
                            G.jsx)(M.Z, {
                                variant: "h5",
                                children: "or"
                            })
                        })]
                    }), o && (0,
                    G.jsx)(M.Z, {
                        variant: "body1",
                        children: o
                    })]
                }), (0,
                G.jsxs)(k.Z, {
                    children: [(0,
                    G.jsx)(w.Z, {
                        variant: "contained",
                        color: "secondary",
                        component: h.rU,
                        to: "/",
                        children: "Go Home"
                    }), p && (0,
                    G.jsx)(w.Z, {
                        variant: "contained",
                        color: "primary",
                        onClick: i,
                        children: "Reconnect"
                    })]
                })]
            })
        };
        function RemoteGame(e) {
            var n = e.isAi
              , r = (0,
            i.UO)().roomId
              , c = void 0 === r ? null : r
              , d = (0,
            o.Ds)().enqueueSnackbar
              , u = m(c, n)
              , v = u.playMove
              , f = u.state
              , p = u.reset
              , x = u.reconnect
              , h = (0,
            a.useState)(null)
              , Z = (0,
            t.Z)(h, 2)
              , y = Z[0]
              , j = Z[1]
              , g = (0,
            a.useState)(null)
              , b = (0,
            t.Z)(g, 2)
              , M = b[0]
              , C = b[1]
              , w = (0,
            a.useCallback)((function(e) {
                if (y && M)
                    if (v) {
                        var n = {
                            card: y.card,
                            src: M,
                            dst: e,
                            type: "Move"
                        }
                          , r = v(n);
                        r ? d(r, {
                            variant: "error"
                        }) : (j(null),
                        C(null))
                    } else
                        d("Game loading, try again", {
                            variant: "warning"
                        })
            }
            ), [v, M, y, d])
              , k = (0,
            a.useCallback)((function(e) {
                if (v) {
                    var n = v({
                        card: e,
                        type: "Discard"
                    });
                    n ? d(n, {
                        variant: "error"
                    }) : (j(null),
                    C(null))
                } else
                    d("Game loading, try again", {
                        variant: "warning"
                    })
            }
            ), [v, d]);
            if (!f)
                return (0,
                G.jsx)(s.Z, {});
            var R = f.blueCards
              , S = f.redCards
              , B = f.spare
              , O = f.turn
              , I = f.grid
              , P = f.canMove
              , q = f.winner
              , z = f.player
              , E = f.lastMove
              , W = f.connection
              , T = function getMoves(e, n, r) {
                if (!e || !n)
                    return function() {
                        return !1
                    }
                    ;
                var t = n.moves
                  , a = "Red" === r ? t.map((function(n) {
                    var r = n.x
                      , t = n.y;
                    return "".concat(e.x + r, ",").concat(e.y + t)
                }
                )) : t.map((function(n) {
                    var r = n.x
                      , t = n.y;
                    return "".concat(e.x - r, ",").concat(e.y - t)
                }
                ))
                  , o = new Set(a);
                return function(e, n) {
                    return o.has("".concat(e, ",").concat(n))
                }
            }(M, y, O);
            return (0,
            G.jsxs)(G.Fragment, {
                children: [(0,
                G.jsx)(D, {
                    state: f,
                    reconnect: x
                }), (0,
                G.jsx)(l.Z, {
                    src: M,
                    setSrc: C,
                    card: y,
                    setCard: j,
                    blueCards: R,
                    redCards: S,
                    grid: I,
                    isMoveValid: T,
                    canMove: P,
                    reset: p,
                    winner: q,
                    spare: B,
                    turn: O,
                    player: z,
                    move: w,
                    discard: k,
                    lastMove: E,
                    connectionStatus: W
                })]
            })
        }
        RemoteGame.defaultProps = {
            isAi: !1
        };
        var B = RemoteGame
    },
    6287: function(e, n, r) {
        r.d(n, {
            Wb: function() {
                return a
            },
            ec: function() {
                return o
            }
        });
        var t = {
            "http:": "ws",
            "https:": "wss"
        }[document.location.protocol]
          , a = "".concat(t, "://").concat(document.location.host, "/ws/")
          , o = "/ws/event"
    },
    1805: function(e, n, r) {
        var t = r(6287);
        n.Z = function onEvent(e) {
            window.fetch(t.ec, {
                method: "POST",
                body: e,
                mode: "no-cors"
            }).catch((function() {}
            ))
        }
    },
    4474: function(e, n, r) {
        r.d(n, {
            Z: function() {
                return getMeta
            }
        });
        var t = null;
        function getMeta() {
            if (null != t)
                return t;
            try {
                t = function getMetaUncached() {
                    var e = "v1.2.14"
                      , n = localStorage.getItem("uid");
                    if (null != n)
                        return {
                            build: e,
                            uid: n
                        };
                    var r = window.crypto.randomUUID();
                    return localStorage.setItem("uid", r),
                    {
                        build: e,
                        uid: r
                    }
                }()
            } catch (e) {}
            return t
        }
    }
}]);
