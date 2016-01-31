# Rules

See [chatRules](https://github.com/pillowfication/moo/blob/master/src/rules/chatRules.js) for the full specifications.

### moo

Responds with `moo`.

### ping (or !ping)

Private message only. Responds with `pong`.

### !note <name> <data>

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
