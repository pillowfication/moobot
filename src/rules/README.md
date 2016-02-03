# Rules

 - [`moo`](#moo)
 - [`ping`](#ping-or-ping)
 - [`!note <name> <data>`](#note-name-data)
 - [`!remi`](#remi-rating)
 - [`!pillow <message>`](#pillow-message)

**admin stuffs**: `!name <name>`, `!send <user> <message>`, `!send-group <group> <message>`, `!sleep`, `!wake-up`,
`!die`

___

### [moo](https://github.com/pillowfication/moo/blob/master/src/rules/_moo.js)

Responds with `moo`.

```
moo
-> moo: moo
```

### [ping (or !ping)](https://github.com/pillowfication/moo/blob/master/src/rules/_ping.js)

Private message only. Responds with `pong`.

```
ping
-> moo: pong
```

### [!help](https://github.com/pillowfication/moo/blob/master/src/rules/_help.js)

Responds with a link back to here.

```
!help
-> moo: https://github.com/pillowfication/moo/tree/master/src/rules
```

### [!note \<name\> \<data\>](https://github.com/pillowfication/moo/blob/master/src/rules/_note.js)

If `<data>` is not provided, it will try to respond with the note with name `<name>`.

```
!note moo
-> moo: Moo moo moo!
```

If `<data>` is provided, it will create or update the note with name `<name>` with the new data.

```
!note moo "I am a cow."
-> moo: Note saved! (moo: I am a cow.)
!note moo
-> moo: I am a cow.
```

### [!remi <\rating\>](https://github.com/pillowfication/moo/blob/master/src/rules/_remi.js)

Responds with a random Danbooru link of Remilia Scarlet. If `<rating>` is provided, it will filter to that rating. Possible ratings are Safe (s), Questionable (q), and Explicit (e).

```
!remi
-> moo: (Safe) https://danbooru.donmai.us/posts/1348309?tags=remilia_scarlet
!remi safe
-> moo: (Safe) https://danbooru.donmai.us/posts/1645882?tags=remilia_scarlet
```

### [!pillow \<message\>](https://github.com/pillowfication/moo/blob/master/src/rules/_pillow.js)

Sends a message to Pillowfication.

```
!pillow "Hello, Pillow!"
-> moo: To Pillowfication: Hello, Pillow!
```
