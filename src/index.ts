import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onTaskAssigned } from "./notifications";
import { onTaskApproved } from "./progressSync";
import { onGroupUpdated } from "./groupTriggers";

admin.initializeApp();

export const taskAssigned = onTaskAssigned;
export const taskApproved = onTaskApproved;
export const groupUpdated = onGroupUpdated;
