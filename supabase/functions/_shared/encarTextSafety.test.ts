import { test, expect } from "bun:test";
import { mapDetailBody, mapDetailColor, sanitizeFacets } from "./encarTextSafety";

const bodies = { "경차":"mini", "소형차":"sedan", "준중형차":"sedan", "중형차":"sedan", "대형차":"sedan", "스포츠카":"coupe", "SUV":"suv", "RV":"minivan", "승합차":"van", "화물차":"truck" };
for (const [input, output] of Object.entries(bodies)) test(`body ${input}`, () => expect(mapDetailBody(input)).toBe(output));
const colors = { "흰색":"White", "화이트":"White", "검정색":"Black", "검은색":"Black", "은색":"Silver", "회색":"Gray", "쥐색":"Gray", "진주색":"Pearl White", "파란색":"Blue", "청색":"Blue", "빨간색":"Red", "분홍색":"Pink", "갈색":"Brown", "녹색":"Green", "노란색":"Yellow", "주황색":"Orange", "금색":"Gold", "은회색":"Silver Gray", "하늘색":"Light Blue", "베이지":"Beige", "보라색":"Purple", "청록색":"Teal", "기타":"Other" };
for (const [input, output] of Object.entries(colors)) test(`color ${input}`, () => expect(mapDetailColor(input)).toBe(output));
test("unknown Hangul body becomes null", () => expect(mapDetailBody("미등록차")).toBeNull());
test("unknown Hangul color becomes null", () => expect(mapDetailColor("미등록색")).toBeNull());
test("facet safety drops Hangul values without affecting counts", () => {
  expect(sanitizeFacets({ total: 10, body_types: [{ value:"준중형차", count:2 }, { value:"sedan", count:8 }], brands:[{slug:"bmw",name:"BMW"},{slug:"bad",name:"한글"}] })).toEqual({total:10,body_types:[{value:"sedan",count:8}],brands:[{slug:"bmw",name:"BMW"}]});
});