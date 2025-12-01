# shipit

auto-generate and ship git commits with ai. never write a commit message again.

## install

```bash
npm install -g shipitai
```

## setup

before using shipit, configure your openrouter api key:

```bash
shipit config set
```

you'll be prompted for your api key. it's stored locally in `~/.shipit`.

## usage

### auto-commit

automatically generate a commit message based on your staged changes:

```bash
shipit
```

this will show you the ai-generated commit message, then automatically commits and pushes.

### view config

see your current configuration:

```bash
shipit config get
```

### reset config

remove your stored api key and start fresh:

```bash
shipit config reset
```

## what it does

1. looks at your staged git changes
2. sends them to openai's api to generate a commit message
3. shows you the suggestion
4. commits with that message if you approve

## requirements

- git repository initialized
- openrouter key (get one at https://openrouter.ai/settings/keys)

## license

MIT
