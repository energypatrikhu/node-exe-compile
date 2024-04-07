# node-exe-compile
`node-exe-compile` is a small config based wrapper for `@yao-pkg/pkg` (fork of vercel's `pkg` package)

it is using `esbuild` to minify and boundle the script specified in the config file, then using `pkg` it compiles to an `exe` file

# Usage
1. Install the package
    ```
    npm install -D energypatrikhu/node-exe-compile
    ```
  
2. Start `node-exe-compile` to generate the configuration file
    > this creates an example configuration file, that later can be modified to set the compiled name and others..
    ```
    node-exe-compile
    ```

3. After that is done, you have to start `node-exe-compile` again
    > now the script minifies and then compiles the given script to an executable
    ```
    node-exe-compile
    ```

# Configuration
The generated configuration file is almost identical to the default configuration file needed for the `pkg` package, with a few additions
- `name`: the name of the file after compiling
- `main`: this is the location of the main file, commonly `src/index.[ts,js]`
- `bin`: the path to the minified and boundled script (this most of the times does not need to be changed)
- `pkg`: pkg options
  - `targets`: NodeJS version (latest == node20)
  - `assets`: when using packages that has `.node` extension the value has to be set, otherwise it may fail to start
  - `outputPath`: the path where the executable will be built
  - `additional`: this contains the additional settings for `pkg` (currently only supports the `compress` option)
    - `compress`: the compression used at complile time
