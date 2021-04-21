import { AccessPermission, PERMISSION_DENIED_MESSAGE } from "../AccessPermission";
import { AccessQuery } from "../AccessQuery";

/*
 |--------------------------------------------------------------------------------
 | Mock
 |--------------------------------------------------------------------------------
 */

const query = new AccessQuery({
  patient: {
    read: true
  },
  doctor: {
    read: false
  },
  medicine: {
    prescribe: {
      ibuprofen: 100
    }
  }
});

/*
 |--------------------------------------------------------------------------------
 | Custom Handler
 |--------------------------------------------------------------------------------
 */

type Prescription = {
  type: string;
  amount: number;
};

type Drugs = {
  [type: string]: number;
};

function prescription({ type, amount }: Prescription) {
  return function (drugs: Drugs) {
    const dosage = drugs[type];
    if (!dosage) {
      return new AccessPermission({ granted: false, message: `You are not eligible to prescribe ${type}.` });
    }
    if (amount > dosage) {
      return new AccessPermission({
        granted: false,
        message: `Prescribed ${amount} of ${type} exceeds the allowed amount of ${dosage}.`
      });
    }
    return new AccessPermission({ granted: true });
  };
}

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("AccessQuery", () => {
  describe("Mutations", () => {
    it("should allow prescribing ibuprofen 80", () => {
      expect(query.can("prescribe", "medicine", prescription({ type: "ibuprofen", amount: 80 })).granted).toBeTruthy();
    });

    it("should deny prescribing cephalexin", () => {
      const permission = query.can("prescribe", "medicine", prescription({ type: "cephalexin", amount: 100 }));
      expect(permission.granted).toBeFalsy();
      expect(permission.message).toEqual("You are not eligible to prescribe cephalexin.");
    });

    it("should deny prescribing ibuprofen 120", () => {
      const permission = query.can("prescribe", "medicine", prescription({ type: "ibuprofen", amount: 120 }));
      expect(permission.granted).toBeFalsy();
      expect(permission.message).toEqual("Prescribed 120 of ibuprofen exceeds the allowed amount of 100.");
    });
  });

  describe("Read", () => {
    it("should use default action handler", () => {
      expect(query.can("read", "patient").granted).toBeTruthy();
      expect(query.can("read", "patient").attributes).toEqual(["*"]);
    });

    it("should deny read access to doctors", () => {
      const permission = query.can("read", "doctor");
      expect(permission.granted).toBeFalsy();
      expect(permission.message).toEqual(PERMISSION_DENIED_MESSAGE);
    });
  });
});
