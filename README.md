# node-exe-compiler
`node-exe-compiler` is a small config based wrapper for [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) (fork of [vercel's pkg](https://github.com/vercel/pkg) package)

it is using [esbuild](https://github.com/evanw/esbuild) to minify and bundle the script specified in the config file, then using `pkg` it compiles to an `exe` file

# Usage
1. Install the package
    ```
    npm install -D energypatrikhu/node-exe-compiler
    ```

2. Start `node-exe-compiler` to generate the configuration file
    > this creates an example configuration file, that later can be modified to set the compiled name and others..
    ```
    node-exe-compiler
    ```

3. After that is done, you have to start `node-exe-compiler` again
    > now the script minifies and then compiles the given script to an executable
    ```
    node-exe-compiler
    ```

# Configuration
The generated configuration file is almost identical to the default configuration file needed for the `pkg` package, with a few additions
- `name`: the name of the file after compiling
- `main`: this is the location of the main file, commonly `src/index.[ts,js]`
- `bin`: the path to the minified and bundled script (this most of the times does not need to be changed)
- `pkg`: pkg options
  - `targets`: NodeJS version (latest == node20)
  - `assets`: when using packages that has `.node` extension the value has to be set, otherwise it may fail to start
  - `outputPath`: the path where the executable will be built
  - `additional`: this contains the additional settings for `pkg`
    - `compress`: the compression used at complile time
    - ...
