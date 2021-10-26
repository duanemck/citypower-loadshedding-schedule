import { AzureFunction, Context, HttpRequest } from "@azure/functions"

class TimeZone {
  constructor(public startHour: number){}
  stages: number[][];
  startMinute: number;
  endHour: number;
  endMinute: number;

  public dayZoneIsInStage(stage: number, zone: number) : number[] {
    let stages = this.stages[stage - 1];
    
    let indices : number[] = [];
    let index = 0;
    do {
      index = stages.indexOf(zone, index) + 1;
      if (index > 0) {
        indices.push(index);
      }
    } while (index > 0);
    return indices;
  }

  public startTime() {
    return `${`${this.startHour}`.padStart(2,'0')}:00`;
  }

  public endTime() {
    return `${`${this.startHour + 2}`.padStart(2,'0')}:30`;
  }  
}

function calculateNextStage(startTime: number, seed: TimeZone) : TimeZone {
  let next = new TimeZone(startTime);
  next.stages = [];
  next.stages[0] = seed.stages[0].map(mapZone);
  next.stages[1] = seed.stages[1].map(mapZone);
  next.stages[2] = seed.stages[2].map(mapZone);
  next.stages[3] = seed.stages[3].map(mapZone);
  return next;
}

function mapZone(i:number) {
  return i+1 > 16 ? i+1 -16: i+1
}

const seed: TimeZone = new TimeZone(0);
seed.stages = [
      [1,13,9,5,2,14,10,6,3,15,11,7,4,16,12,8,5,1,13,9,6,2,14,10,7,3,15,11,8,4,16],
      [5,1,13,9,6,2,14,10,7,3,15,11,8,4,16,12,9,5,1,13,10,6,2,14,11,7,3,15,12,8,4],
      [9,5,1,13,10,6,2,14,11,7,3,15,12,8,4,16,13,9,5,1,14,10,6,2,15,11,7,3,16,12,8],
      [13,9,5,1,14,10,6,2,15,11,7,3,16,12,8,4,1,13,9,5,2,14,10,6,3,15,11,7,4,16,12]
  ];

const zone2am  = calculateNextStage(2, seed);
const zone4am  = calculateNextStage(4, zone2am);
const zone6am  = calculateNextStage(6, zone4am);
const zone8am  = calculateNextStage(8, zone6am);
const zone10am = calculateNextStage(10, zone8am);
const zone12pm = calculateNextStage(12, zone10am);
const zone2pm  = calculateNextStage(14, zone12pm);
const zone4pm  = calculateNextStage(16, zone2pm);
const zone6pm  = calculateNextStage(18, zone4pm);
const zone8pm  = calculateNextStage(20, zone6pm);
const zone10pm = calculateNextStage(22, zone8pm);

const timeslots = [seed, zone2am, zone4am, zone6am, zone8am, zone10am, zone12pm, zone2pm, zone4pm, zone6pm, zone8pm, zone10pm];

function scheduleForZoneAndStage(zone: number, stage: number) {
  let schedule : any = [];
  while(stage >= 1) {
    timeslots.forEach(slot=> {
      let days = slot.dayZoneIsInStage(stage,zone);
      days.forEach((day) => {
        if (!schedule[day]) schedule[day] = [];
        schedule[day].push(slot);
      });
    });
    stage--;
  }

  return schedule;  
}


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  let zone = Number(req.query.zone);
  let stage = Number(req.query.stage);
  let day = Number(req.query.day);

  if (!zone || !stage || !day) {
    context.res = {
         status: 400, /* Defaults to 200 */
        body: "Please ensure you have set zone, stage and day"
    };
  } else {  
      let schedule = scheduleForZoneAndStage(zone, stage)[day].map(slot => {
        return {
          startTime: slot.startTime(),
          endTime: slot.endTime()
        }
      });
      // for (let slot of schedule[day].map((slot:TimeZone)=> `${slot.startTime()} - ${slot.endTime()}`)) {
      // console.log(`- ${slot}`);  
      context.res = {
        body: schedule
      }
    }


};

export default httpTrigger;


    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };