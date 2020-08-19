# KISS Promise Pool

When there is multiple async tasks to run. R 


```js
 return await PromisePool.toArray(
            2, // Number of concurrent tasks
            [1,2,3,4,5,6,7], // Source data
            async n => {
                // do something async with n
            }
)    
```        