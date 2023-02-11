import { Arguments } from "yargs";
import { exit } from "../methods/utils";

const SINGLE_DISCLAIMER = `Moonbeam Signer  Copyright (C) 2023  Purestake Ltd
This program comes with ABSOLUTELY NO WARRANTY. For details, run with command \`license\`.
This is free software, and you are welcome to redistribute it under certain conditions.
`;

const LICENSE_DETAILS = `Moonbeam Signer  Copyright (C) 2023  Purestake Ltd

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`;

export const licenseMiddleware = (argv: Arguments) => {
  if (argv._.length > 0 && argv._[0] == "license") {
    return;
  }
  console.log(SINGLE_DISCLAIMER);
  return;
};

export const licenseCommand = {
  command: "license",
  describe: "displays the license",
  handler: async () => {
    console.log(LICENSE_DETAILS);
    exit();
  },
};
