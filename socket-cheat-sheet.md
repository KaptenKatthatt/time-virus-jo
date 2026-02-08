# Socket.IO Cheat Sheet

## `io.emit`

Skickar till alla uppkopplade sockets, inklusive den som eventuellt precis kopplade upp sig.

## `socket.broadcast.emit`

Skickar till alla **andra** uppkopplade sockets **förutom** `socket` (alltså den som orsakade/skickade eventet).

## `socket.emit`

Skickar **enbart** till den orsakade/skickade eventet.
