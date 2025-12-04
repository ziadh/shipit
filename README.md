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

you'll be prompted for your api key and model preference. it's stored locally in `~/.shipit`.

alternatively, set individual config values directly:

```bash
# set just the api key
shipit config set --apiKey your-key-here

# set just the model
shipit config set --model x-ai/grok-4.1-fast:free

# set both at once
shipit config set --apiKey your-key --model your-model
```

## usage

### auto-commit

automatically generate a commit message based on your staged changes:

```bash
shipit
```

this will show you the ai-generated commit message, then automatically commits and pushes.

### manage config

view your current configuration:

```bash
shipit config get
```

reset your configuration:

```bash
shipit config reset
```

view config file location:

```bash
shipit config path
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
