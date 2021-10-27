# City Power Loadshedding Schedule API

Quick and dirty API that exposes the City Power 2 hour loadshedding schedule found [here](https://www.citypower.co.za/customers/Load%20Shedding%20Related%20Documents/City%20Power%20load%20shedding%20schedule%20February%202021.pdf)

This is a Node.js Azure Function using TypeScript, but the logic could be easily copied into any JS framework.

**Disclaimer:** It's very possible that the schedule will be changed and this could become out of date.

## Why?

Eskom exposes an API containing the current level at [https://loadshedding.eskom.co.za/LoadShedding/GetStatus](https://loadshedding.eskom.co.za/LoadShedding/GetStatus) and there are some similar APIs for schedules but not for City Power.

I use this in my Home Automation system to keep me up to date on loadshedding and my personal schedule.